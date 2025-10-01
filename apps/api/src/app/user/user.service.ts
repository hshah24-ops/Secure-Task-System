import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import * as bcrypt from 'bcrypt';

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
      relations: ['role', 'role.permissions', 'organization'], // load role, organization and permissions
    });
  }

  // Find user by email (for login)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions', 'organization'],
    });
  }

  // Create user (with hashed password and role)
  async createUser(requester: User, email: string, plainPassword: string, roleId: number): Promise<User> {
    if (!['Owner', 'Admin'].includes(requester.role.name)) {
      throw new ForbiddenException('Only admins/owners can add users');
    }
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = this.userRepository.create({
      email,
      password: passwordHash,
      role,
      organization: requester.organization,
    });
    return this.userRepository.save(user);
  }

  // Verify password (for login)
  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    //const bcrypt = await import('bcrypt');
    return bcrypt.compare(plainPassword, user.password);
  }

  // Return all users (for admin debugging)
  async findAll(requester: User): Promise<User[]> {
    if (!['Owner', 'Admin'].includes(requester.role.name)) {
    throw new ForbiddenException('Not allowed to list users');
  }
    return this.userRepository.find({ 
	//where: { organization: { id: orgId } }, 
	relations: ['role', 'organization'] });
  }
}