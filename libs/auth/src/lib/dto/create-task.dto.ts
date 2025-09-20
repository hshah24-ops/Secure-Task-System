export class CreateTaskDto {
  title!: string;
  description!: string;
  category?: string;
  status!: string;
}