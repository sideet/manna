import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/services';
import { GetUserRequestDTO, LoginRequestDTO, SignupRequestDTO } from './dto';
import { UserDTO } from '../../lib/common/dtos/user.dto';
import { CommonUtil } from 'src/lib/common/utils';
import { AuthGuard } from 'src/lib/common/guards/user.guard';
import { ParamUser } from 'src/lib/common/decorators';
import { AuthUser } from 'src/lib/common/dtos/auth.dto';

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
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiOkResponse({ description: '성공' })
  async withdraw(@ParamUser() user: AuthUser) {
    const { user_no } = user;
    await this.userService.deleteUser(user_no);

    return { message: '탈퇴 성공' };
  }
}
