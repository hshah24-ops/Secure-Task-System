import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string; // Owner, Admin, Viewer

 @ManyToOne(() => Role, (role) => role.childRoles, { nullable: true })
  parentRole?: Role;

  // Roles that inherit from this role
  @OneToMany(() => Role, (role) => role.parentRole)
  childRoles?: Role[];

  @OneToMany(() => User, user => user.role)
  users!: User[];

  @ManyToMany(() => Permission, { eager: true })  //link roles with permission 
  @JoinTable() //tell typeORM own relation and creates join table
  permissions!: Permission[]; //load permission when load a role
}