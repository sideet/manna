import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from 'src/services';
import { GetUserRequestDTO, SignupRequestDTO } from './dto';
import { CommonUtil } from 'src/lib/common/utils';
import { UserAccessTokenGuard } from 'src/lib/common/guards/user_access_token.guard';
import { DateConversion, ParamUser } from 'src/lib/common/decorators';
import { AuthUser } from 'src/lib/common/dtos/auth.dto';

@Controller()
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly commonUtil: CommonUtil
  ) {}

  @Get('user')
  @DateConversion()
  async getUser(@Query() query: GetUserRequestDTO) {
    const user = await this.userService.getUser({ email: query.email });

    return user;
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiOkResponse({ description: '성공' })
  @DateConversion()
  async signup(@Body() body: SignupRequestDTO) {
    const { email, name } = await this.userService.createUser(body);

    return { email, name };
  }

  @Delete('user')
  @UseGuards(UserAccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiOkResponse({ description: '성공' })
  async withdraw(@ParamUser() user: AuthUser) {
    const { user_no } = user;
    await this.userService.deleteUser(user_no);

    return { message: '탈퇴 성공' };
  }
}
