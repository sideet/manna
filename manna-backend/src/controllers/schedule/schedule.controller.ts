import { BadRequestException, Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from 'src/services';

import { CommonUtil } from 'src/lib/common/utils';
import { AuthGuard } from 'src/lib/common/guards/user.guard';

import { AuthUser } from 'src/lib/common/dtos/auth.dto';
import { ParamUser } from 'src/lib/common/decorators';
import { AnswerScheduleRequestDTO, CreateScheduleRequestDTO, DeleteScheduleRequestDTO, GetGuestScheduleRequestDTO, GetScheduleRequestDTO } from './dto';
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
  async createSchedule(@ParamUser() user: AuthUser, @Body() body: CreateScheduleRequestDTO) {
    const schedule = await this.scheduleService.createSchedule({
      ...body,
      user_no: user.user_no,
    });

    return schedule;
  }

  @Get('schedules')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '회원이 생성한 일정 목록 조회' })
  @ApiOkResponse({ description: '성공', type: [SchedulesDTO] })
  async getSchedules(@ParamUser() user: AuthUser) {
    const { schedules } = await this.scheduleService.getSchedules(user.user_no);

    return {
      schedules: schedules.map((schedule) => {
        return new SchedulesDTO(schedule);
      }),
    };
  }

  @Get('schedule/guest')
  @ApiOperation({ summary: '게스트 일정 조회(code)' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
  async getGuestSchedule(@Query() query: GetGuestScheduleRequestDTO) {
    const { schedule } = await this.scheduleService.getScheduleByCode(query.code);

    return { schedule: new ScheduleDTO(schedule) };
  }

  @Get('schedule')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '일정 상세 조회(schedule_no)' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
  async getSchedule(@Query() query: GetScheduleRequestDTO) {
    const { schedule } = await this.scheduleService.getSchedule(query.schedule_no);

    return { schedule: new ScheduleDTO(schedule) };
  }

  @Delete('schedule')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '일정 삭제' })
  @ApiOkResponse({ description: '성공', type: ScheduleDTO })
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
}
