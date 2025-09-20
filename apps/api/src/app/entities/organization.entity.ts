import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // For 2-level hierarchy: parent organization (nullable for top-level org)
  @ManyToOne(() => Organization, org => org.children, { nullable: true })
  parent!: Organization | null;

  // Children orgs
  @OneToMany(() => Organization, org => org.parent)
  children!: Organization[];

  @OneToMany(() => User, user => user.organization)
  users!: User[];
}