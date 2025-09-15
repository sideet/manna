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

import { CommonUtil } from 'src/lib/common/utils';
import { AuthGuard } from 'src/lib/common/guards/user.guard';

import { AuthUser } from 'src/lib/common/dtos/auth.dto';
import { ParamUser, DateConversion } from 'src/lib/common/decorators';
import {
  AnswerScheduleRequestDTO,
  CreateScheduleRequestDTO,
  DeleteScheduleRequestDTO,
  GetGuestScheduleRequestDTO,
  GetScheduleParticipantsRequestDTO,
  GetScheduleRequestDTO,
  GetScheduleUnitsRequestDTO,
} from './dto';
import { ScheduleDTO, SchedulesDTO } from 'src/lib/common/dtos/schedule.dto';

@Controller()
@ApiTags('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly commonUtil: CommonUtil
  ) {}

  @Post('schedule')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '일정생성' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
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
  @ApiOkResponse({ description: '성공', type: [SchedulesDTO] })
  @UseGuards(AuthGuard)
  @DateConversion()
  async getSchedules(@ParamUser() user: AuthUser) {
    const { schedules } = await this.scheduleService.getSchedules(user.user_no);

    return {
      schedules,
    };
  }

  @Get('schedule/guest')
  @ApiOperation({ summary: '게스트 일정 조회(code)' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
  async getGuestSchedule(@Query() query: GetGuestScheduleRequestDTO) {
    const { schedule } = await this.scheduleService.getScheduleByCode(
      query.code
    );

    return { schedule };
  }

  @Get('schedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 상세 조회(schedule_no)' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
  @UseGuards(AuthGuard)
  async getSchedule(@Query() query: GetScheduleRequestDTO) {
    const { schedule } = await this.scheduleService.getSchedule(
      query.schedule_no
    );

    return { schedule };
  }

  @Get('schedule/units')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 시간 조회' })
  @ApiOkResponse({ description: '성공' })
  @UseGuards(AuthGuard)
  async getScheduleUnits(@Query() query: GetScheduleUnitsRequestDTO) {
    const { schedule_units } = await this.scheduleService.getScheduleUnits(
      query.schedule_no,
      query.search_date
    );

    return { schedule_units };
  }

  @Get('schedule/participants')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 참여자 조회' })
  @ApiOkResponse({ description: '성공' })
  @UseGuards(AuthGuard)
  async getScheduleParticipants(
    @Query() query: GetScheduleParticipantsRequestDTO
  ) {
    const { schedule_participants, next_cursor } =
      await this.scheduleService.getScheduleParticipants({
        schedule_no: query.schedule_no,
        cursor: query.cursor,
        count: query.count,
        sort: query.sort,
      });

    return { schedule_participants, next_cursor };
  }

  @Delete('schedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 삭제' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
  @UseGuards(AuthGuard)
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

  @Get('schedule/coffeechat/ranking')
  @ApiOperation({ summary: '커피챗 랭킹 조회' })
  @ApiOkResponse({ description: '성공' })
  async getCoffeeChatRanking() {
    const { ranking } = await this.scheduleService.getCoffeeChatRanking();

    return { ranking };
  }

  @Get('schedule/realtime/ranking')
  @ApiOperation({ summary: 'manna 실시간 랭킹 조회' })
  @ApiOkResponse({ description: '성공' })
  async getRealTimeRanking() {
    const { schedule_count, participant_count, schedule_total_count } =
      await this.scheduleService.getRealTimeRanking();

    return {
      schedule_count,
      participant_count,
      schedule_total_count,
    };
  }
}
