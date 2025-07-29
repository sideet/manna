import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/services';
import { GetUserRequestDTO, LoginRequestDTO, SignupRequestDTO } from './dto';
import { UserDTO } from '../../lib/common/dtos/user.dto';
import { CommonUtil } from 'src/lib/common/utils';
import { AuthGuard } from 'src/lib/common/guards/user.guard';

@Controller()
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly commonUtil: CommonUtil
  ) {}

  @Get('user')
  async getUser(@Query() query: GetUserRequestDTO) {
    const user = await this.userService.getUser({ email: query.email });

    return new UserDTO(user);
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiOkResponse({ description: '성공' })
  async signup(@Body() body: SignupRequestDTO) {
    const user = await this.userService.createUser(body);

    return new UserDTO(user);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ description: '성공' })
  async login(@Body() body: LoginRequestDTO) {
    const user = await this.userService.login({ email: body.email, password: body.password });

    const access_token = this.commonUtil.encodeJwtToken(
      {
        user_no: user.no,
        email: user.email,
      },
      {
        expiresIn: '1d',
      }
    );

    return { access_token, user: new UserDTO(user) };
  }

  @Delete('user')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiOkResponse({ description: '성공' })
  async withdraw(@Body() user_no: number) {
    await this.userService.deleteUser(user_no);

    return { message: '탈퇴 성공' };
  }
}
