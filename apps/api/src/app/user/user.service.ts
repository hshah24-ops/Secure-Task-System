import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Find user by ID
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'], // load role and permissions
    });
  }

  // Find user by email (for login)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });
  }

  // Create user (with hashed password and role)
  async createUser(email: string, passwordHash: string, roleId: number): Promise<User> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new Error('Role not found');

    const user = this.userRepository.create({
      email,
      password: passwordHash,
      role,
    });
    return this.userRepository.save(user);
  }

  // Verify password (for login)
  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(plainPassword, user.password);
  }

  // Return all users (for admin debugging)
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['role'] });
  }
}