import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { DataSource } from 'typeorm';
import { User } from '../app/entities/user.entity';
import { Task } from '../app/entities/task.entity';
import { Organization } from '../app/entities/organization.entity';
import { Role } from '../app/entities/role.entity';
import { RolesService } from '@secure-task-manager/auth';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const dataSource = app.get(DataSource);
  const rolesService = app.get(RolesService); // get RolesService

  try {
    const userRepo = dataSource.getRepository(User);
    const taskRepo = dataSource.getRepository(Task);
    const orgRepo = dataSource.getRepository(Organization);
    const roleRepo = dataSource.getRepository(Role);

    // --- Fetch default organization ---
    let organization = await orgRepo.findOne({ where: { id: 1 } });
    if (!organization) {
      organization = orgRepo.create({ name: 'Headquarters' });
      await orgRepo.save(organization);
    }

    // --- Fetch roles ---
    let ownerRole = await roleRepo.findOne({ where: { name: 'Owner' } });
    let viewerRole = await roleRepo.findOne({ where: { name: 'Viewer' } });

    if (!ownerRole) {
      ownerRole = roleRepo.create({ name: 'Owner' });
      await roleRepo.save(ownerRole);
    }
    if (!viewerRole) {
      viewerRole = roleRepo.create({ name: 'Viewer' });
      await roleRepo.save(viewerRole);
    }

    // --- Seed users ---
    const usersToSeed = [
      { email: 'testuser_owner@example.com', password: 'password123', role: ownerRole },
      { email: 'testuser_viewer@example.com', password: 'password123', role: viewerRole },
    ];

    for (const u of usersToSeed) {
      const existingUser = await userRepo.findOne({ where: { email: u.email } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        const user = userRepo.create({
          email: u.email,
          password: hashedPassword,
          organization,
          role: u.role,
        });
        await userRepo.save(user);
        console.log(`Seeded user: ${u.email} | ${u.password}`);

        // --- Create tasks only if user has permission ---
        if (rolesService.hasPermission(u.role.id, 'create_task')) {
          const task = taskRepo.create({
            title: `Task for ${u.email}`,
            description: 'This is a seeded task.',
            completed: false,
            category: 'Work',
            status: 'Todo',
            createdBy: user,
            organization,
          });
          await taskRepo.save(task);
          console.log(`Seeded task for ${u.email}`);
        } else {
          console.log(`User ${u.email} does not have permission to create tasks. Skipping task creation.`);
        }
      } else {
        console.log(`User ${u.email} already exists. Skipping.`);
      }
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await app.close();
  }
}

bootstrap();