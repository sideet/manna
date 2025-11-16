import { IsNumber, IsString } from 'class-validator';

export class AuthUser {
  @IsNumber()
  user_no: number;

  @IsString()
  email: string;
}
