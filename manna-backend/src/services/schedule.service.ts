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
      const schedule = await this.schedulesRepository.create({ data: scheduleData }, connection);
      const insert_schedult_unit = [];

      const zone = 'Asia/Seoul';

      let current_date = DateTime.fromJSDate(new Date(start_date)).setZone(zone);
      const final_date = DateTime.fromJSDate(new Date(end_date)).setZone(zone);

      if (time_unit === 'day') {
        while (current_date <= final_date) {
          let date = current_date.toFormat('yyyy-MM-dd');
          insert_schedult_unit.push({
            date: DateTime.fromJSDate(new Date(date)).setZone('Asia/Seoul').toFormat('yyyy-MM-dd'),
            time: null,
            schedule_no: schedule.no,
          });
          current_date = current_date.plus({ days: 1 });
        }
      } else if (time_unit === 'minute' || time_unit === 'hour') {
        if (!start_time || !end_time) throw new BadRequestException('시간을 선택해주세요.');

        const [startHour, startMinute] = start_time.split(':').map(Number);
        const [endHour, endMinute] = end_time.split(':').map(Number);

        const base_time = DateTime.fromObject({ hour: startHour, minute: startMinute }, { zone });
        const limit_time = DateTime.fromObject({ hour: endHour, minute: endMinute }, { zone });

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

      await this.scheduleUnitsRepository.creates({ data: insert_schedult_unit }, connection);

      // 코드생성
      let code: string = '';
      let code_check: boolean = true;

      while (code_check) {
        code = this.commonUtil.generateBase62Code();

        const exist_code = await this.schedulesRepository.get(
          {
            where: { code },
            include: {
              user: true,
            },
          },
          connection
        );

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
    const schedule = await this.schedulesRepository.get({ where: { no: schedule_no, enabled: true }, include: { user: true } });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_participants: ScheduleParticipantDTO[] = await this.scheduleParticipantsRepository.gets({
      where: { schedule_no },
      include: {
        participation_times: {
          include: {
            schedule_unit: true,
          },
        },
      },
    });

    let schedule_participants_dto: ScheduleParticipantDTO[] = schedule_participants.map((participant) => {
      const decrypt_email = participant.email ? this.commonUtil.decrypt(participant.email) : '';
      const decrypt_phone = participant.phone ? this.commonUtil.decrypt(participant.phone) : '';

      return new ScheduleParticipantDTO({ ...participant, email: decrypt_email, phone: decrypt_phone });
    });

    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: { schedule_no: schedule_no, enabled: true },
      include: {
        participation_times: {
          include: {
            schedule_participant: true,
          },
        },
      },
    });

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
              no: time.schedule_participant.no,
              email: time.schedule_participant.email ? this.commonUtil.decrypt(time.schedule_participant.email) : '',
              name: time.schedule_participant.name,
              phone: time.schedule_participant.phone ? this.commonUtil.decrypt(time.schedule_participant.phone) : '',
              memo: time.schedule_participant.memo,
              create_datetime: convertDateTime(time.schedule_participant.create_datetime),
              update_datetime: convertDateTime(time.schedule_participant.update_datetime),
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
                no: time.schedule_participant.no,
                email: time.schedule_participant.email ? this.commonUtil.decrypt(time.schedule_participant.email) : '',
                name: time.schedule_participant.name,
                phone: time.schedule_participant.phone ? this.commonUtil.decrypt(time.schedule_participant.phone) : '',
                memo: time.schedule_participant.memo,
                create_datetime: convertDateTime(time.schedule_participant.create_datetime),
                update_datetime: convertDateTime(time.schedule_participant.update_datetime),
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
   * 일정 시간 조회
   * @method
   */
  async getScheduleUnits(schedule_no: number, date: string) {
    const schedule = await this.schedulesRepository.get({ where: { no: schedule_no, enabled: true }, include: { user: true } });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: { schedule_no: schedule_no, enabled: true, date: { gte: date, lte: DateTime.fromJSDate(new Date(date)).plus({ days: 7 }).setZone('Asia/Seoul').toFormat('yyyy-MM-dd') } },
      include: {
        participation_times: {
          include: {
            schedule_participant: true,
          },
        },
      },
    });

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

    if (schedule_units.length < 1) {
      return {
        schedule_units: {},
      };
    }

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
              no: time.schedule_participant.no,
              email: time.schedule_participant.email ? this.commonUtil.decrypt(time.schedule_participant.email) : '',
              name: time.schedule_participant.name,
              phone: time.schedule_participant.phone ? this.commonUtil.decrypt(time.schedule_participant.phone) : '',
              memo: time.schedule_participant.memo,
              create_datetime: convertDateTime(time.schedule_participant.create_datetime),
              update_datetime: convertDateTime(time.schedule_participant.update_datetime),
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
                no: time.schedule_participant.no,
                email: time.schedule_participant.email ? this.commonUtil.decrypt(time.schedule_participant.email) : '',
                name: time.schedule_participant.name,
                phone: time.schedule_participant.phone ? this.commonUtil.decrypt(time.schedule_participant.phone) : '',
                memo: time.schedule_participant.memo,
                create_datetime: convertDateTime(time.schedule_participant.create_datetime),
                update_datetime: convertDateTime(time.schedule_participant.update_datetime),
              };
            }),
          },
        ];
      }
    });

    return {
      schedule_units: units,
    };
  }

  /**
   * 일정 참여자 조회
   * @method
   */
  async getScheduleParticipants({ schedule_no, cursor, count, sort = 'asc' }: { schedule_no: number; cursor: string; count: number; sort: 'desc' | 'asc' }) {
    const schedule = await this.schedulesRepository.get({ where: { no: schedule_no, enabled: true }, include: { user: true } });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_participants: ScheduleParticipantDTO[] = await this.scheduleParticipantsRepository.gets({
      where: { schedule_no },
      ...(cursor && {
        skip: 1,
        cursor: {
          no: JSON.parse(this.commonUtil.decrypt(cursor)),
        },
      }),
      take: count,
      orderBy: [{ no: sort }],
      include: {
        participation_times: {
          include: {
            schedule_unit: true,
          },
        },
      },
    });

    let schedule_participants_dto: ScheduleParticipantDTO[] = schedule_participants.map((participant) => {
      const decrypt_email = participant.email ? this.commonUtil.decrypt(participant.email) : '';
      const decrypt_phone = participant.phone ? this.commonUtil.decrypt(participant.phone) : '';

      return new ScheduleParticipantDTO({ ...participant, email: decrypt_email, phone: decrypt_phone });
    });

    if (schedule_participants_dto.length < 1) {
      return {
        schedule_participants: schedule_participants_dto,
        next_cursor: null,
      };
    }

    const next_cursor = this.commonUtil.encrypt(JSON.stringify({ no: schedule_participants[schedule_participants.length - 1].no }));

    return {
      schedule_participants: schedule_participants_dto,
      next_cursor,
    };
  }

  /**
   * 일정 조회
   * @method
   */
  async getScheduleByCode(code: string) {
    const schedule = await this.schedulesRepository.get({ where: { code, enabled: true }, include: { user: true } });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    let schedule_participants_dto: ScheduleParticipantDTO[] = [];

    if (schedule.is_participant_visible) {
      const schedule_participants = await this.scheduleParticipantsRepository.gets({
        where: { schedule_no: schedule.no },
        include: {
          participation_times: {
            include: {
              schedule_unit: true,
            },
          },
        },
      });

      schedule_participants_dto = schedule_participants.map((participant) => {
        const decrypt_email = participant.email ? this.commonUtil.decrypt(participant.email) : '';
        const decrypt_phone = participant.phone ? this.commonUtil.decrypt(participant.phone) : '';
        return new ScheduleParticipantDTO({ ...participant, phone: decrypt_phone, email: decrypt_email });
      });
    }

    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: { schedule_no: schedule.no, enabled: true },
      include: {
        participation_times: {
          include: {
            schedule_participant: true,
          },
        },
      },
    });

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
              no: time.schedule_participant.no,
              email: time.schedule_participant.email ? this.commonUtil.decrypt(time.schedule_participant.email) : '',
              name: time.schedule_participant.name,
              phone: time.schedule_participant.phone ? this.commonUtil.decrypt(time.schedule_participant.phone) : '',
              memo: time.schedule_participant.memo,
              create_datetime: convertDateTime(time.schedule_participant.create_datetime),
              update_datetime: convertDateTime(time.schedule_participant.update_datetime),
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
                no: time.schedule_participant.no,
                email: time.schedule_participant.email ? this.commonUtil.decrypt(time.schedule_participant.email) : '',
                name: time.schedule_participant.name,
                phone: time.schedule_participant.phone ? this.commonUtil.decrypt(time.schedule_participant.phone) : '',
                memo: time.schedule_participant.memo,
                create_datetime: convertDateTime(time.schedule_participant.create_datetime),
                update_datetime: convertDateTime(time.schedule_participant.update_datetime),
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
  async getSchedules(user_no: number) {
    const schedules = await this.schedulesRepository.gets({ where: { user_no: user_no, enabled: true }, include: { schedule_participants: true } });

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
    const schedule = await this.schedulesRepository.get({ where: { no: schedule_no, enabled: true }, include: { user: true } });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_unit = await this.scheduleUnitsRepository.gets({
      where: {
        no: {
          in: schedule_unit_nos,
        },
        enabled: true,
      },
      include: {
        participation_times: {
          include: {
            schedule_participant: true,
          },
        },
      },
    });

    if (schedule_unit.length !== schedule_unit_nos.length) throw new BadRequestException('선택할 수 없는 시간이 포함되어있습니다.');

    if (schedule.type === 'individual') {
      const duplicate_participation = await this.participationTimesRepository.gets({
        where: {
          schedule_unit_no: {
            in: schedule_unit_nos,
          },
          enabled: true,
        },
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
          data: {
            email: encrypt_email,
            name,
            phone: encrypt_phone,
            memo,
            schedule: {
              connect: {
                no: schedule_no,
              },
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
      await this.participationTimesRepository.creates({ data: insert_schedult_unit }, connection);
    });

    return;
  }
}
