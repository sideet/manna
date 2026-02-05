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
import { ScheduleService } from 'src/services';
import { UserAccessTokenGuard } from 'src/lib/common/guards/user_access_token.guard';
import { AuthUser } from 'src/lib/common/dtos/auth.dto';
import { ParamUser, DateConversion } from 'src/lib/common/decorators';
import {
  AnswerScheduleRequestDTO,
  CancelConfirmScheduleRequestDTO,
  ConfirmScheduleRequestDTO,
  CreateScheduleRequestDTO,
  SendConfirmationEmailRequestDTO,
  CreateScheduleResponseDTO,
  DeleteScheduleRequestDTO,
  GetGuestScheduleRequestDTO,
  GetGuestScheduleResponseDTO,
  GetGuestScheduleUnitsCodeRequestDTO,
  GetGuestScheduleUnitsResponseDTO,
  GetScheduleParticipantsRequestDTO,
  GetScheduleParticipantsResponseDTO,
  GetScheduleRequestDTO,
  GetScheduleResponseDTO,
  GetScheduleUnitsRequestDTO,
  GetScheduleUnitsResponseDTO,
  GetGroupConfirmInfoRequestDTO,
  GetGroupConfirmInfoResponseDTO,
  GetIndividualConfirmInfoRequestDTO,
  GetIndividualConfirmInfoResponseDTO,
} from './dto';

@Controller()
@ApiTags('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('schedule')
  @ApiBearerAuth()
  @UseGuards(UserAccessTokenGuard)
  @ApiOperation({ summary: '일정생성' })
  @ApiOkResponse({ description: '성공', type: CreateScheduleResponseDTO })
  @DateConversion()
  async createSchedule(
    @ParamUser() user: AuthUser,
    @Body() body: CreateScheduleRequestDTO
  ) {
    const schedule = await this.scheduleService.createSchedule({
      ...body,
      user_no: user.user_no,
    });

    return schedule;
  }

  @Get('schedules')
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원이 생성한 일정 목록 조회' })
  @ApiOkResponse({ description: '성공', type: GetScheduleResponseDTO })
  @UseGuards(UserAccessTokenGuard)
  @DateConversion()
  async getSchedules(@ParamUser() user: AuthUser) {
    const { schedules } = await this.scheduleService.getSchedules({
      user_no: user.user_no,
    });

    return {
      schedules,
    };
  }

  @Get('schedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 상세 조회(schedule_no)' })
  @ApiOkResponse({ description: '성공', type: GetScheduleResponseDTO })
  @UseGuards(UserAccessTokenGuard)
  async getSchedule(@Query() query: GetScheduleRequestDTO) {
    const { schedule } = await this.scheduleService.getSchedule({
      schedule_no: query.schedule_no,
    });

    return { schedule };
  }

  @Get('schedule/participants')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 참여자 조회' })
  @ApiOkResponse({
    description: '성공',
    type: GetScheduleParticipantsResponseDTO,
  })
  @UseGuards(UserAccessTokenGuard)
  async getScheduleParticipants(
    @Query() query: GetScheduleParticipantsRequestDTO
  ) {
    const { total_count, schedule_participants, next_cursor } =
      await this.scheduleService.getScheduleParticipants({
        ...query,
      });

    return { total_count, next_cursor, schedule_participants };
  }

  @Get('schedule/units')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 시간 조회' })
  @ApiOkResponse({ description: '성공', type: GetScheduleUnitsResponseDTO })
  @UseGuards(UserAccessTokenGuard)
  async getScheduleUnits(@Query() query: GetScheduleUnitsRequestDTO) {
    const { schedule_units } = await this.scheduleService.getScheduleUnits({
      ...query,
    });

    return { schedule_units };
  }

  @Get('schedule/guest')
  @ApiOperation({ summary: '게스트 일정 조회(게스트용)' })
  @ApiOkResponse({ description: '성공', type: GetGuestScheduleResponseDTO })
  async getGuestSchedule(@Query() query: GetGuestScheduleRequestDTO) {
    const { schedule } = await this.scheduleService.getSchedule({
      code: query.code,
    });

    return { schedule };
  }

  @Get('schedule/units/guest')
  @ApiOperation({ summary: '일정 시간 조회(게스트용)' })
  @ApiOkResponse({
    description: '성공',
    type: GetGuestScheduleUnitsResponseDTO,
  })
  async getGuestScheduleUnits(
    @Query() query: GetGuestScheduleUnitsCodeRequestDTO
  ) {
    const { schedule_units } = await this.scheduleService.getGuestScheduleUnits(
      { ...query }
    );

    return { schedule_units };
  }

  @Delete('schedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 삭제' })
  @ApiOkResponse({ description: '성공' })
  @UseGuards(UserAccessTokenGuard)
  async deleteSchedule(@Body() body: DeleteScheduleRequestDTO) {
    await this.scheduleService.deleteSchedules(body.schedule_no);

    return {};
  }

  @Post('schedule/answer')
  @ApiOperation({ summary: '일정응답' })
  @ApiOkResponse({ description: '성공' })
  async answerSchedule(@Body() body: AnswerScheduleRequestDTO) {
    await this.scheduleService.answerSchedule({
      ...body,
    });

    return {};
  }

  @Post('schedule/confirm')
  @ApiBearerAuth()
  @UseGuards(UserAccessTokenGuard)
  @ApiOperation({ summary: '일정 확정' })
  @ApiOkResponse({ description: '성공' })
  async confirmSchedule(
    @ParamUser() user: AuthUser,
    @Body() body: ConfirmScheduleRequestDTO
  ) {
    await this.scheduleService.confirmSchedule({
      ...body,
      user_no: user.user_no,
    });

    return {};
  }

  @Post('schedule/confirm/cancel')
  @ApiBearerAuth()
  @UseGuards(UserAccessTokenGuard)
  @ApiOperation({ summary: '일정 확정 취소' })
  @ApiOkResponse({ description: '성공' })
  async cancelConfirmSchedule(
    @ParamUser() user: AuthUser,
    @Body() body: CancelConfirmScheduleRequestDTO
  ) {
    await this.scheduleService.cancelConfirmSchedule({
      ...body,
      user_no: user.user_no,
    });

    return {};
  }

  @Post('schedule/confirm/email')
  @ApiBearerAuth()
  @UseGuards(UserAccessTokenGuard)
  @ApiOperation({ summary: '확정 메일 전송' })
  @ApiOkResponse({ description: '성공' })
  async sendConfirmationEmail(
    @ParamUser() user: AuthUser,
    @Body() body: SendConfirmationEmailRequestDTO
  ) {
    const result = await this.scheduleService.sendConfirmationEmail({
      ...body,
      user_no: user.user_no,
    });

    return result;
  }

  @Get('schedule/confirm/group')
  @ApiBearerAuth()
  @UseGuards(UserAccessTokenGuard)
  @ApiOperation({ summary: '그룹 일정 확정 정보 조회' })
  @ApiOkResponse({ description: '성공', type: GetGroupConfirmInfoResponseDTO })
  async getGroupConfirmInfo(
    @ParamUser() user: AuthUser,
    @Query() query: GetGroupConfirmInfoRequestDTO
  ) {
    const result = await this.scheduleService.getGroupConfirmInfo({
      schedule_no: query.schedule_no,
      user_no: user.user_no,
    });

    return result;
  }

  @Get('schedule/confirm/individual')
  @ApiBearerAuth()
  @UseGuards(UserAccessTokenGuard)
  @ApiOperation({ summary: '개인 일정 확정 정보 조회' })
  @ApiOkResponse({
    description: '성공',
    type: GetIndividualConfirmInfoResponseDTO,
  })
  async getIndividualConfirmInfo(
    @ParamUser() user: AuthUser,
    @Query() query: GetIndividualConfirmInfoRequestDTO
  ) {
    const result = await this.scheduleService.getIndividualConfirmInfo({
      schedule_no: query.schedule_no,
      user_no: user.user_no,
    });

    return result;
  }
}
