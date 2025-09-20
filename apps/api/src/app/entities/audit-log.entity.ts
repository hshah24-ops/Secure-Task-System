import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: string; // e.g., "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK"

  @Column()
  userId!: number; // who performed the action 

  @CreateDateColumn()
  timestamp!: Date;
}