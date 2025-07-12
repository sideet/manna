import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/lib/database/repository';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUser({ email }) {
    return await this.usersRepository.getUser({ email });
  }
}
