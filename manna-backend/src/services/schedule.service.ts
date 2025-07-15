import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Schedule_participants, Schedule_units, Schedules, Users } from '@prisma/client';
import { CommonUtil } from 'src/lib/common/utils/common.util';
import { ScheduleWithParticipants, SchedulesRepository } from 'src/lib/database/repository';
import { DateTime } from 'luxon';
import { CreateScheduleRequestDTO } from 'src/controllers/schedule/dto/create_schedule_request.dto';
import { PrismaService } from 'src/lib/database/prisma.service';
import { ScheduleUnitsRepository } from 'src/lib/database/repository/schedule_units.repository';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly prisma: PrismaService,
    private readonly schedulesRepository: SchedulesRepository,
    private readonly scheduleUnitsRepository: ScheduleUnitsRepository
  ) {}

  /**
   * 일정 생성
   * @method
   */
  async createSchedule(schedule_info: CreateScheduleRequestDTO & { user_no: number }): Promise<{ schedule: Schedules }> {
    const { user_no, name, description, type, is_participant_visible, is_duplicate_participation, start_date, end_date, start_time, end_time, time_unit, time } = schedule_info;

    const scheduleData: Prisma.SchedulesCreateInput = {
      name,
      description,
      type,
      is_participant_visible,
      is_duplicate_participation,
      time_unit,
      time,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      users: {
        connect: {
          no: user_no,
        },
      },
    };

    const { result } = await this.prisma.$transaction(async (connection) => {
      const schedule = await this.schedulesRepository.create(scheduleData, connection);
      const insert_schedult_unit = [];

      const zone = 'Asia/Seoul';

      let current_date = DateTime.fromJSDate(new Date(start_date)).setZone(zone);
      const final_date = DateTime.fromJSDate(new Date(end_date)).setZone(zone);

      const [startHour, startMinute] = start_time.split(':').map(Number);
      const [endHour, endMinute] = end_time.split(':').map(Number);

      const base_time = DateTime.fromObject({ hour: startHour, minute: startMinute }, { zone });
      const limit_time = DateTime.fromObject({ hour: endHour, minute: endMinute }, { zone });

      if (time_unit === 'day') {
        while (current_date <= final_date) {
          let date = current_date.toFormat('yyyy-MM-dd');
          insert_schedult_unit.push({
            date: DateTime.fromJSDate(new Date(date)).setZone('Asia/Seoul').toFormat('yyyy-MM-dd'),
            time: null,
            schedules: {
              connect: {
                no: schedule.no,
              },
            },
          });
          current_date = current_date.plus({ days: 1 });
        }
      } else if (time_unit === 'minute' || time_unit === 'hour') {
        const step = time_unit === 'minute' ? { minutes: 30 } : { hours: time };

        while (current_date <= final_date) {
          let date = current_date.toFormat('yyyy-MM-dd');

          let current_time = base_time;

          while (current_time <= limit_time) {
            let time = current_time.toFormat('HH:mm:ss');
            insert_schedult_unit.push({
              date: DateTime.fromJSDate(new Date(date)).setZone('Asia/Seoul').toFormat('yyyy-MM-dd'),
              time: DateTime.fromJSDate(new Date(time)).setZone('Asia/Seoul').toFormat('HH:mm:ss'),
              schedule_no: schedule.no,
            });

            current_time = current_time.plus(step);
          }

          current_date = current_date.plus({ days: 1 });
        }
      }

      await this.scheduleUnitsRepository.creates(insert_schedult_unit, connection);

      // 코드생성
      const code = this.commonUtil.encrypt(`${schedule.no}`);

      const result = await this.schedulesRepository.update({ where: { no: schedule.no }, data: { code } }, connection);

      return { result };
    });

    return { schedule: result };
  }

  /**
   * 일정 조회
   * @method
   */

  async getSchedule(schedule_no: number) {
    const schedule = await this.schedulesRepository.get({ no: schedule_no, enabled: true });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_units = await this.scheduleUnitsRepository.gets({ schedule_no: schedule_no });

    const units: {
      [date: string]: {
        no: number;
        time: string;
        enabled: boolean;
        date: string;
        schedule_no: number;
      }[];
    } = {};

    schedule_units.forEach((unit) => {
      const data = units[unit.date];

      if (data) {
        data.push({ ...unit });
      } else {
        units[unit.date] = [{ ...unit }];
      }
    });

    return {
      schedule: {
        ...schedule,
        schedule_units: units,
      },
    };
  }

  /**
   * 일정 조회
   * @method
   */

  async getSchedules(user_no: number): Promise<{ schedules: ScheduleWithParticipants[] }> {
    const schedules = await this.schedulesRepository.gets({ user_no: user_no, enabled: true });

    return { schedules };
  }
}
