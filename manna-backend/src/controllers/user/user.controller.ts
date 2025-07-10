import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from 'src/services';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user')
  async getUser(@Query() email: string) {
    const user = await this.userService.getUser({ email });

    return { user };
  }
}
