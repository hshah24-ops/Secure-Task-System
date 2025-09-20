import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ nullable: true })
  category?: string;  

  @Column({ default: 'Todo' })
  status!: string;   // e.g., Todo, InProgress, Done

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.id)
  owner!: User;

  @ManyToOne(() => Organization, org => org.id)
  organization!: Organization;
}