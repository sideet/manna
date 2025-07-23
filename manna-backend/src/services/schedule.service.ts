import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Schedules } from '@prisma/client';
import { CommonUtil } from 'src/lib/common/utils/common.util';
import { ParticipationTimesRepository, ScheduleParticipantsRepository, SchedulesRepository } from 'src/lib/database/repositories';
import { DateTime } from 'luxon';
import { CreateScheduleRequestDTO } from 'src/controllers/schedule/dto/create_schedule_request.dto';
import { PrismaService } from 'src/lib/database/prisma.service';
import { ScheduleUnitsRepository } from 'src/lib/database/repositories/schedule_units.repository';
import { AnswerScheduleRequestDTO } from 'src/controllers/schedule/dto';
import { ScheduleParticipantDTO } from 'src/lib/common/dtos/schedule.dto';
import { ScheduleWithParticipants } from 'src/lib/database/types/schedules.type';
import { convertDateTime } from 'src/lib/common/prototypes/date';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly prisma: PrismaService,
    private readonly schedulesRepository: SchedulesRepository,
    private readonly scheduleUnitsRepository: ScheduleUnitsRepository,
    private readonly scheduleParticipantsRepository: ScheduleParticipantsRepository,
    private readonly participationTimesRepository: ParticipationTimesRepository
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
      user: {
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

          while (current_time < limit_time) {
            let time = current_time.toFormat('HH:mm:ss');
            insert_schedult_unit.push({
              date: DateTime.fromJSDate(new Date(date)).setZone('Asia/Seoul').toFormat('yyyy-MM-dd'),
              time: DateTime.fromJSDate(new Date(`${date} ${time}`))
                .setZone('Asia/Seoul')
                .toFormat('HH:mm:ss'),
              schedule_no: schedule.no,
            });

            current_time = current_time.plus(step);
          }

          current_date = current_date.plus({ days: 1 });
        }
      }

      await this.scheduleUnitsRepository.creates(insert_schedult_unit, connection);

      // 코드생성
      let code: string = '';
      let code_check: boolean = true;

      while (code_check) {
        code = this.commonUtil.generateBase62Code();

        const exist_code = await this.schedulesRepository.get({ code }, connection);

        if (!exist_code) code_check = false;
      }

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

    const schedule_participants: ScheduleParticipantDTO[] = await this.scheduleParticipantsRepository.gets({ schedule_no });

    let schedule_participants_dto: ScheduleParticipantDTO[] = schedule_participants.map((participant) => {
      const decrypt_email = participant.email ? this.commonUtil.decrypt(participant.email) : '';
      const decrypt_phone = participant.phone ? this.commonUtil.decrypt(participant.phone) : '';

      return new ScheduleParticipantDTO({ ...participant, email: decrypt_email, phone: decrypt_phone });
    });

    const schedule_units = await this.scheduleUnitsRepository.gets({ schedule_no: schedule_no });

    const units: {
      [date: string]: {
        no: number;
        time: string;
        enabled: boolean;
        date: string;
        schedule_no: number;
        schedule_participants?: {
          no: number;
          email: string;
          name: string;
          phone: string;
          memo: string;
          create_datetime: string;
          update_datetime: string;
        }[];
      }[];
    } = {};

    schedule_units.forEach((unit) => {
      const data = units[unit.date];

      if (data) {
        data.push({
          no: unit.no,
          date: unit.date,
          time: unit.time,
          enabled: unit.enabled,
          schedule_no: unit.schedule_no,
          schedule_participants: unit.participation_times.map((time) => {
            return {
              no: time.schedule_participants.no,
              email: time.schedule_participants.email ? this.commonUtil.decrypt(time.schedule_participants.email) : '',
              name: time.schedule_participants.name,
              phone: time.schedule_participants.phone ? this.commonUtil.decrypt(time.schedule_participants.phone) : '',
              memo: time.schedule_participants.memo,
              create_datetime: convertDateTime(time.schedule_participants.create_datetime),
              update_datetime: convertDateTime(time.schedule_participants.update_datetime),
            };
          }),
        });
      } else {
        units[unit.date] = [
          {
            no: unit.no,
            date: unit.date,
            time: unit.time,
            enabled: unit.enabled,
            schedule_no: unit.schedule_no,
            schedule_participants: unit.participation_times.map((time) => {
              return {
                no: time.schedule_participants.no,
                email: time.schedule_participants.email ? this.commonUtil.decrypt(time.schedule_participants.email) : '',
                name: time.schedule_participants.name,
                phone: time.schedule_participants.phone ? this.commonUtil.decrypt(time.schedule_participants.phone) : '',
                memo: time.schedule_participants.memo,
                create_datetime: convertDateTime(time.schedule_participants.create_datetime),
                update_datetime: convertDateTime(time.schedule_participants.update_datetime),
              };
            }),
          },
        ];
      }
    });

    return {
      schedule: {
        ...schedule,
        schedule_units: units,
        schedule_participants: schedule_participants_dto,
      },
    };
  }

  /**
   * 일정 조회
   * @method
   */
  async getScheduleByCode(code: string) {
    const schedule = await this.schedulesRepository.get({ code, enabled: true });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    let schedule_participants_dto: ScheduleParticipantDTO[] = [];

    if (schedule.is_participant_visible) {
      const schedule_participants = await this.scheduleParticipantsRepository.gets({ schedule_no: schedule.no });

      schedule_participants_dto = schedule_participants.map((participant) => {
        const decrypt_email = participant.email ? this.commonUtil.decrypt(participant.email) : '';
        const decrypt_phone = participant.phone ? this.commonUtil.decrypt(participant.phone) : '';
        return new ScheduleParticipantDTO({ ...participant, phone: decrypt_phone, email: decrypt_email });
      });
    }

    const schedule_units = await this.scheduleUnitsRepository.gets({ schedule_no: schedule.no });

    const units: {
      [date: string]: {
        no: number;
        time: string;
        enabled: boolean;
        date: string;
        schedule_no: number;
        schedule_participants?: {
          no: number;
          email: string;
          name: string;
          phone: string;
          memo: string;
          create_datetime: string;
          update_datetime: string;
        }[];
      }[];
    } = {};

    schedule_units.forEach((unit) => {
      const data = units[unit.date];

      if (data) {
        data.push({
          no: unit.no,
          date: unit.date,
          time: unit.time,
          enabled: unit.enabled,
          schedule_no: unit.schedule_no,
          schedule_participants: unit.participation_times.map((time) => {
            return {
              no: time.schedule_participants.no,
              email: time.schedule_participants.email ? this.commonUtil.decrypt(time.schedule_participants.email) : '',
              name: time.schedule_participants.name,
              phone: time.schedule_participants.phone ? this.commonUtil.decrypt(time.schedule_participants.phone) : '',
              memo: time.schedule_participants.memo,
              create_datetime: convertDateTime(time.schedule_participants.create_datetime),
              update_datetime: convertDateTime(time.schedule_participants.update_datetime),
            };
          }),
        });
      } else {
        units[unit.date] = [
          {
            no: unit.no,
            date: unit.date,
            time: unit.time,
            enabled: unit.enabled,
            schedule_no: unit.schedule_no,
            schedule_participants: unit.participation_times.map((time) => {
              return {
                no: time.schedule_participants.no,
                email: time.schedule_participants.email ? this.commonUtil.decrypt(time.schedule_participants.email) : '',
                name: time.schedule_participants.name,
                phone: time.schedule_participants.phone ? this.commonUtil.decrypt(time.schedule_participants.phone) : '',
                memo: time.schedule_participants.memo,
                create_datetime: convertDateTime(time.schedule_participants.create_datetime),
                update_datetime: convertDateTime(time.schedule_participants.update_datetime),
              };
            }),
          },
        ];
      }
    });

    return {
      schedule: {
        ...schedule,
        schedule_units: units,
        schedule_participants: schedule_participants_dto,
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

  /**
   * 일정 조회
   * @method
   */
  async deleteSchedules(schedule_no: number) {
    await this.schedulesRepository.update({ where: { no: schedule_no }, data: { enabled: false, delete_datetime: new Date() } });

    return {};
  }

  /**
   * 일정 응답
   * @method
   */
  async answerSchedule(answer_info: AnswerScheduleRequestDTO) {
    const { schedule_no, email, name, phone, memo, schedule_unit_nos } = answer_info;
    const schedule = await this.schedulesRepository.get({ no: schedule_no, enabled: true });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_unit = await this.scheduleUnitsRepository.gets({
      no: {
        in: schedule_unit_nos,
      },
      enabled: true,
    });

    if (schedule_unit.length !== schedule_unit_nos.length) throw new BadRequestException('선택할 수 없는 시간이 포함되어있습니다.');

    if (schedule.type === 'individual') {
      const duplicate_participation = await this.participationTimesRepository.gets({
        schedule_unit_no: {
          in: schedule_unit_nos,
        },
        enabled: true,
      });
      if (duplicate_participation.length > 0) {
        throw new BadRequestException('다른 참여자가 참여한 시간은 선택할 수 없습니다.');
      }
    }

    const insert_schedult_unit = [];

    await this.prisma.$transaction(async (connection) => {
      const encrypt_email = this.commonUtil.encrypt(email);
      const encrypt_phone = this.commonUtil.encrypt(phone);

      // 참가자 정보 저장
      const participant = await this.scheduleParticipantsRepository.create(
        {
          email: encrypt_email,
          name,
          phone: encrypt_phone,
          memo,
          schedules: {
            connect: {
              no: schedule_no,
            },
          },
        },
        connection
      );

      schedule_unit_nos.forEach((no) => {
        insert_schedult_unit.push({
          schedule_unit_no: no,
          schedule_participant_no: participant.no,
        });
      });

      // 참가 시간 저장
      await this.participationTimesRepository.creates(insert_schedult_unit, connection);
    });

    return;
  }
}
