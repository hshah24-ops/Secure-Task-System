import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  id: number;
  roleId: number;
  organizationId: number;
}

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
  async createUser(requester: JwtPayload, email: string, plainPassword: string, roleId: number): Promise<User> {
  // RBAC: Only Owner/Admin can create users
    if (!this.isOwnerOrAdmin(requester.roleId)) {
      throw new ForbiddenException('Only admins/owners can add users');
    }
    
   // Check duplicate email
    const userExists = await this.userRepository.findOne({ where: { email } });
    if (userExists) throw new ForbiddenException('User with this email already exists'); 

   // Validate role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

   // Hash password
    const passwordHash = await bcrypt.hash(plainPassword, 10);

   // Create user in same org as requester
    const user = this.userRepository.create({
      email,
      password: passwordHash,
      role,
      organization: {id: requester.organizationId } as any,
      createdBy: {id: requester.id } as any
    });
    return this.userRepository.save(user);
  }

  // Verify password (for login)
  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    //const bcrypt = await import('bcrypt');
    return bcrypt.compare(plainPassword, user.password);
  }

  // Return all users in requester org
  async findAll(requester: JwtPayload): Promise<User[]> {
  // RBAC: Only Owner or Admin can list users
    if (!this.isOwnerOrAdmin(requester.roleId)) {
    throw new ForbiddenException('Not allowed to list users');
  }
    return this.userRepository.find({ 
	where: { organization: { id: requester.organizationId } }, 
	relations: ['role', 'organization'] });
  }
  private isOwnerOrAdmin(roleId: number) {
    return roleId === 1 || roleId === 2;
  }
}