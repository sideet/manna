import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Schedules } from '@prisma/client';
import { CommonUtil } from 'src/lib/common/utils/common.util';
import {
  ParticipationTimesRepository,
  RegionDetailRepository,
  RegionRepository,
  ScheduleParticipantsRepository,
  SchedulesRepository,
} from 'src/lib/database/repositories';
import { CreateScheduleRequestDTO } from 'src/controllers/schedule/dto/create_schedule.dto';
import { PrismaService } from 'src/lib/database/prisma.service';
import { ScheduleUnitsRepository } from 'src/lib/database/repositories/schedule_units.repository';
import {
  AnswerScheduleRequestDTO,
  CancelConfirmScheduleRequestDTO,
  ConfirmScheduleRequestDTO,
  SendConfirmationEmailRequestDTO,
} from 'src/controllers/schedule/dto';
import { ScheduleType, TimeUnit } from 'src/lib/common/enums/schedule.enum';
import { DateUtil } from 'src/lib/common/utils';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly dateUtil: DateUtil,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly schedulesRepository: SchedulesRepository,
    private readonly scheduleUnitsRepository: ScheduleUnitsRepository,
    private readonly scheduleParticipantsRepository: ScheduleParticipantsRepository,
    private readonly participationTimesRepository: ParticipationTimesRepository,
    private readonly regionDetailRepository: RegionDetailRepository,
    private readonly regionRepository: RegionRepository
  ) {}

  /**
   * 일정 생성
   * @method
   */
  async createSchedule(
    schedule: CreateScheduleRequestDTO & { user_no: number }
  ): Promise<{ schedule: Schedules }> {
    const {
      user_no,
      name,
      description,
      type,
      meeting_type,
      detail_address,
      is_participant_visible,
      is_duplicate_participation,
      start_date,
      end_date,
      start_time,
      end_time,
      time_unit,
      time,
      expiry_datetime,
    } = schedule;

    const schedule_data: Prisma.SchedulesCreateInput = {
      name,
      description,
      type,
      meeting_type,
      detail_address,
      is_participant_visible,
      is_duplicate_participation,
      time_unit,
      time,
      start_date: start_date,
      end_date: end_date,
      start_time,
      end_time,
      expiry_datetime: expiry_datetime
        ? this.dateUtil.dayjs(expiry_datetime).tz('Asia/Seoul').toDate()
        : null,
      user: {
        connect: {
          no: user_no,
        },
      },
    };

    const start = this.dateUtil.dayjs(start_date);
    const end = this.dateUtil.dayjs(end_date);

    const diff_month = end.diff(start, 'month');

    if (diff_month > 3)
      throw new BadRequestException('일정은 3개월이내로만 설정가능합니다.');

    const { result } = await this.prisma.$transaction(async (connection) => {
      const schedule = await this.schedulesRepository.create(
        { data: schedule_data },
        connection
      );
      const insert_schedult_unit = [];

      let current_date = this.dateUtil.dayjs(start_date);

      const final_date = this.dateUtil.dayjs(end_date);
      if (time_unit === TimeUnit.DAY) {
        while (current_date <= final_date) {
          let date = current_date.format('YYYY-MM-DD');

          insert_schedult_unit.push({
            date,
            time: null,
            schedule_no: schedule.no,
          });
          current_date = current_date.add(1, 'day');
        }
      } else if (time_unit === 'MINUTE' || time_unit === 'HOUR') {
        if (!start_time || !end_time)
          throw new BadRequestException('시작 시간, 종료 시간을 선택해주세요.');

        if (time_unit === 'HOUR' && (!time || time < 1))
          throw new BadRequestException('시간 간격을 선택해주세요.');

        const [startHour, startMinute] = start_time.split(':').map(Number);
        const [endHour, endMinute] = end_time.split(':').map(Number);

        const base_time = this.dateUtil
          .dayjs()
          .set('hour', startHour)
          .set('minute', startMinute)
          .set('second', 0)
          .set('millisecond', 0);

        const limit_time = this.dateUtil
          .dayjs()
          .set('hour', endHour)
          .set('minute', endMinute)
          .set('second', 0)
          .set('millisecond', 0);

        const step =
          time_unit === TimeUnit.MINUTE ? { minutes: 30 } : { hours: time };

        while (current_date <= final_date) {
          let date = current_date.format('YYYY-MM-DD');

          let current_time = base_time;

          while (current_time <= limit_time) {
            let time = current_time.format('HH:mm:ss');
            insert_schedult_unit.push({
              date,
              time,
              schedule_no: schedule.no,
            });

            current_time = current_time.add(
              step.minutes ?? step.hours,
              step.minutes ? 'minute' : 'hour'
            );
          }
          current_date = current_date.add(1, 'day');
        }
      }

      // 코드생성
      let code: string = '';
      let code_check: boolean = true;

      if (insert_schedult_unit.length > 0) {
        await this.scheduleUnitsRepository.creates(
          { data: insert_schedult_unit },
          connection
        );

        while (code_check) {
          code = this.commonUtil.generateBase62Code();

          const exist_code = await this.schedulesRepository.get(
            {
              where: { code, enabled: true },
              include: {
                user: true,
              },
            },
            connection
          );

          if (!exist_code) code_check = false;
        }

        const result = await this.schedulesRepository.update(
          { where: { no: schedule.no }, data: { code } },
          connection
        );

        return { result };
      }

      return {};
    });

    return { schedule: result };
  }

  /**
   * 일정 목록 조회
   * @method
   */
  async getSchedules({ user_no }: { user_no: number }) {
    const schedules = await this.schedulesRepository.gets({
      where: { user_no: user_no, enabled: true },
      include: {
        _count: {
          select: {
            schedule_participants: true,
          },
        },
        region: {
          select: { no: true, name: true },
        },
        region_detail: {
          select: { no: true, name: true },
        },
      },
    });

    return {
      schedules: schedules.map(({ _count, ...rest }) => ({
        ...rest,
        participant_count: _count.schedule_participants ?? 0,
      })),
    };
  }

  /**
   * 일정 조회
   * @method
   */
  async getSchedule({
    schedule_no,
    code,
  }: {
    schedule_no?: number;
    code?: string;
  }) {
    let schedule = null;

    if (schedule_no) {
      schedule = await this.schedulesRepository.get({
        where: { no: schedule_no, enabled: true },
        include: {
          user: { select: { no: true, name: true, email: true } },
          region: {
            select: { no: true, name: true },
          },
          region_detail: {
            select: { no: true, name: true },
          },
        },
      });
    } else if (code) {
      schedule = await this.schedulesRepository.get({
        where: { code, enabled: true },
        include: {
          user: { select: { no: true, name: true, email: true } },
          region: {
            select: { no: true, name: true },
          },
          region_detail: {
            select: { no: true, name: true },
          },
        },
      });
    }

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    return {
      schedule: {
        ...schedule,
        expiry_datetime: this.dateUtil.convertDateTime(
          schedule.expiry_datetime
        ),
        create_datetime: this.dateUtil.convertDateTime(
          schedule.create_datetime
        ),
        update_datetime: this.dateUtil.convertDateTime(
          schedule.update_datetime
        ),
        delete_datetime: this.dateUtil.convertDateTime(
          schedule.delete_datetime
        ),
      },
    };
  }

  /**
   * 일정 참여자 조회
   * @method
   */
  async getScheduleParticipants({
    schedule_no,
    cursor,
    count,
    sort = 'desc',
  }: {
    schedule_no?: number;
    cursor?: string;
    count?: number;
    sort?: 'desc' | 'asc';
  }) {
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
    });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    if (
      cursor &&
      !this.commonUtil.isJsonString({ value: this.commonUtil.decrypt(cursor) })
    )
      throw new BadRequestException('페이지네이션 정보를 확인해 주세요.');

    const [schedule_participants, schedule_participants_count] =
      await Promise.all([
        this.scheduleParticipantsRepository.gets({
          where: { schedule_no },
          ...(cursor && {
            skip: 1,
            cursor: {
              no: JSON.parse(this.commonUtil.decrypt(cursor)).no,
            },
          }),
          take: count,
          orderBy: [{ no: sort }],
          include: {
            participation_times: {
              select: {
                no: true,
                schedule_unit: {
                  select: {
                    no: true,
                    date: true,
                    time: true,
                    enabled: true,
                    schedule_no: true,
                  },
                },
              },
            },
          },
        }),

        this.scheduleParticipantsRepository.getCount({
          where: { schedule_no },
        }),
      ]);

    let schedule_participants_dto = schedule_participants.map((participant) => {
      const decrypt_email = participant.email
        ? this.commonUtil.decrypt(participant.email)
        : '';
      const decrypt_phone = participant.phone
        ? this.commonUtil.decrypt(participant.phone)
        : '';

      return {
        no: participant.no,
        name: participant.name,
        email: decrypt_email,
        phone: decrypt_phone,
        memo: participant.memo,
        is_confirmed: participant.is_confirmed,
        is_confirmation_mail_sent: participant.is_confirmation_mail_sent,
        participation_times: participant.participation_times,
      };
    });

    const next_cursor =
      schedule_participants.length >= count
        ? this.commonUtil.encrypt(
            JSON.stringify({
              no: schedule_participants[schedule_participants.length - 1].no,
            })
          )
        : null;

    return {
      total_count: schedule_participants_count,
      schedule_participants: schedule_participants_dto,
      next_cursor,
    };
  }

  /**
   * 일정 시간 조회
   * @method
   */
  async getScheduleUnits({
    schedule_no,
    search_date,
  }: {
    schedule_no: number;
    search_date: string;
  }) {
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
    });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: {
        schedule_no: schedule_no,
        enabled: true,
        date: {
          gte: search_date,
          lte: this.dateUtil
            .dayjs(search_date)
            .add(7, 'day')
            .format('YYYY-MM-DD'),
        },
      },
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
          create_datetime: string | Date;
          update_datetime: string | Date;
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
              email: time.schedule_participant.email
                ? this.commonUtil.decrypt(time.schedule_participant.email)
                : '',
              name: time.schedule_participant.name,
              phone: time.schedule_participant.phone
                ? this.commonUtil.decrypt(time.schedule_participant.phone)
                : '',
              memo: time.schedule_participant.memo,
              create_datetime: this.dateUtil.convertDateTime(
                time.schedule_participant.create_datetime
              ),
              update_datetime: this.dateUtil.convertDateTime(
                time.schedule_participant.update_datetime
              ),
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
                email: time.schedule_participant.email
                  ? this.commonUtil.decrypt(time.schedule_participant.email)
                  : '',
                name: time.schedule_participant.name,
                phone: time.schedule_participant.phone
                  ? this.commonUtil.decrypt(time.schedule_participant.phone)
                  : '',
                memo: time.schedule_participant.memo,
                create_datetime: this.dateUtil.convertDateTime(
                  time.schedule_participant.create_datetime
                ),
                update_datetime: this.dateUtil.convertDateTime(
                  time.schedule_participant.update_datetime
                ),
              };
            }),
          },
        ];
      }
    });

    return {
      schedule_units: schedule_units.length > 0 ? units : {},
    };
  }

  /**
   * 일정 시간 조회
   * @method
   */
  async getGuestScheduleUnits({
    schedule_no,
    search_date,
  }: {
    schedule_no: number;
    search_date: string;
  }) {
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
    });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: {
        schedule_no: schedule.no,
        enabled: true,
        date: {
          gte: search_date,
          lte: this.dateUtil
            .dayjs(search_date)
            .add(7, 'day')
            .format('YYYY-MM-DD'),
        },
      },
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
          name: string;
          create_datetime: string | Date;
          update_datetime: string | Date;
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
              name: time.schedule_participant.name,
              create_datetime: this.dateUtil.convertDateTime(
                time.schedule_participant.create_datetime
              ),
              update_datetime: this.dateUtil.convertDateTime(
                time.schedule_participant.update_datetime
              ),
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
                name: time.schedule_participant.name,
                create_datetime: this.dateUtil.convertDateTime(
                  time.schedule_participant.create_datetime
                ),
                update_datetime: this.dateUtil.convertDateTime(
                  time.schedule_participant.update_datetime
                ),
              };
            }),
          },
        ];
      }
    });

    return {
      schedule_units: schedule_units.length > 0 ? units : {},
    };
  }

  /**
   * 일정 조회
   * @method
   */
  async deleteSchedules(schedule_no: number) {
    await this.schedulesRepository.update({
      where: { no: schedule_no },
      data: { enabled: false, delete_datetime: new Date() },
    });

    return {};
  }

  /**
   * 일정 응답
   * @method
   */
  async answerSchedule(answer_info: AnswerScheduleRequestDTO) {
    const { schedule_no, email, name, phone, memo, schedule_unit_nos } =
      answer_info;
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
      include: {
        user: {
          select: { no: true, name: true },
        },
      },
    });

    if (!schedule) throw new BadRequestException('존재하지 않는 일정입니다.');

    // 마감기한 검증
    if (schedule.expiry_datetime) {
      const now = this.dateUtil.dayjs().tz('Asia/Seoul');
      const expiry = this.dateUtil.dayjs(schedule.expiry_datetime).tz('Asia/Seoul');
      if (now.isAfter(expiry)) {
        throw new BadRequestException('마감기한이 지난 일정입니다.');
      }
    }

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

    if (schedule_unit.length !== schedule_unit_nos.length)
      throw new BadRequestException('선택할 수 없는 시간이 포함되어있습니다.');

    if (schedule.type === ScheduleType.INDIVIDUAL) {
      const duplicate_participation =
        await this.participationTimesRepository.gets({
          where: {
            schedule_unit_no: {
              in: schedule_unit_nos,
            },
            enabled: true,
          },
        });
      if (duplicate_participation.length > 0) {
        throw new BadRequestException(
          '다른 참여자가 참여한 시간은 선택할 수 없습니다.'
        );
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
      await this.participationTimesRepository.creates(
        { data: insert_schedult_unit },
        connection
      );
    });

    return;
  }

  /**
   * 일정 확정
   * @method
   */
  async confirmSchedule(
    confirm_info: ConfirmScheduleRequestDTO & { user_no: number }
  ) {
    const { user_no, schedule_no, schedule_unit_no, schedule_participant_nos } =
      confirm_info;

    // 1. 일정 조회 및 권한 확인
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
    });

    if (!schedule) {
      throw new BadRequestException('존재하지 않는 일정입니다.');
    }

    if (schedule.user_no !== user_no) {
      throw new BadRequestException('일정 확정 권한이 없습니다.');
    }

    // 2. 일정 단위 확인
    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: { no: schedule_unit_no, schedule_no, enabled: true },
    });

    if (schedule_units.length === 0) {
      throw new BadRequestException('존재하지 않는 일정 단위입니다.');
    }

    // 3. 개별 일정인 경우 참가자는 1명만 가능
    if (
      schedule.type === ScheduleType.INDIVIDUAL &&
      schedule_participant_nos.length !== 1
    ) {
      throw new BadRequestException(
        '개별 일정은 한 명의 참가자만 확정할 수 있습니다.'
      );
    }

    // 4. 해당 참가자들이 해당 시간대에 참여했는지 확인
    const participation_times = await this.participationTimesRepository.gets({
      where: {
        schedule_unit_no,
        schedule_participant_no: { in: schedule_participant_nos },
        enabled: true,
      },
    });

    if (participation_times.length !== schedule_participant_nos.length) {
      throw new BadRequestException(
        '해당 시간대에 참여하지 않은 참가자가 포함되어 있습니다.'
      );
    }

    // 5. 기존 확정 여부 확인
    const existing_confirmed = await this.participationTimesRepository.gets({
      where: {
        schedule_unit: { schedule_no },
        is_confirmed: true,
      },
    });

    if (existing_confirmed.length > 0) {
      throw new BadRequestException(
        '이미 확정된 일정이 있습니다. 기존 확정을 취소한 후 다시 시도해 주세요.'
      );
    }

    // 6. 확정 처리 (participation_times)
    await this.participationTimesRepository.updateMany({
      where: {
        schedule_unit_no,
        schedule_participant_no: { in: schedule_participant_nos },
        enabled: true,
      },
      data: { is_confirmed: true },
    });

    // 7. 참가자 확정 여부 업데이트 (schedule_participants)
    await this.scheduleParticipantsRepository.updateMany({
      where: {
        no: { in: schedule_participant_nos },
      },
      data: { is_confirmed: true },
    });

    return {};
  }

  /**
   * 일정 확정 취소
   * @method
   */
  async cancelConfirmSchedule(
    cancel_info: CancelConfirmScheduleRequestDTO & { user_no: number }
  ) {
    const { user_no, schedule_no, schedule_participant_no } = cancel_info;

    // 1. 일정 조회 및 권한 확인
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
    });

    if (!schedule) {
      throw new BadRequestException('존재하지 않는 일정입니다.');
    }

    if (schedule.user_no !== user_no) {
      throw new BadRequestException('일정 확정 취소 권한이 없습니다.');
    }

    // 2. 개별 일정인 경우 참가자 번호 필수
    if (
      schedule.type === ScheduleType.INDIVIDUAL &&
      !schedule_participant_no
    ) {
      throw new BadRequestException(
        '개별 일정은 참가자를 지정해야 합니다.'
      );
    }

    // 3. 확정 취소 처리
    if (schedule.type === ScheduleType.INDIVIDUAL) {
      // 개별 일정: 해당 참가자의 확정만 취소
      await this.participationTimesRepository.updateMany({
        where: {
          schedule_participant_no,
          schedule_unit: { schedule_no },
          is_confirmed: true,
        },
        data: { is_confirmed: false },
      });

      // 참가자 확정 여부 업데이트
      await this.scheduleParticipantsRepository.updateMany({
        where: {
          no: schedule_participant_no,
        },
        data: { is_confirmed: false },
      });
    } else {
      // 팀 일정: 해당 일정의 모든 확정 취소
      await this.participationTimesRepository.updateMany({
        where: {
          schedule_unit: { schedule_no },
          is_confirmed: true,
        },
        data: { is_confirmed: false },
      });

      // 해당 일정의 모든 참가자 확정 여부 업데이트
      await this.scheduleParticipantsRepository.updateMany({
        where: {
          schedule_no,
          is_confirmed: true,
        },
        data: { is_confirmed: false },
      });
    }

    return {};
  }

  /**
   * 확정 메일 전송
   * @method
   */
  async sendConfirmationEmail(
    email_info: SendConfirmationEmailRequestDTO & { user_no: number }
  ) {
    const { user_no, schedule_no, schedule_participant_nos } = email_info;

    // 1. 일정 조회 및 권한 확인
    const schedule = await this.schedulesRepository.get({
      where: { no: schedule_no, enabled: true },
      include: {
        user: {
          select: { no: true, name: true },
        },
      },
    });

    if (!schedule) {
      throw new BadRequestException('존재하지 않는 일정입니다.');
    }

    if (schedule.user_no !== user_no) {
      throw new BadRequestException('메일 전송 권한이 없습니다.');
    }

    // 2. 확정된 참가자 조회
    const participants = await this.scheduleParticipantsRepository.gets({
      where: {
        no: { in: schedule_participant_nos },
        schedule_no,
      },
      include: {
        participation_times: {
          where: { is_confirmed: true },
          include: {
            schedule_unit: true,
          },
        },
      },
    });

    if (participants.length === 0) {
      throw new BadRequestException('참가자를 찾을 수 없습니다.');
    }

    // 3. 확정된 시간 정보 조회
    const confirmedParticipant = participants.find(
      (p) => p.participation_times.length > 0
    );

    if (!confirmedParticipant) {
      throw new BadRequestException('확정된 일정이 없습니다.');
    }

    const confirmedUnit = confirmedParticipant.participation_times[0].schedule_unit;
    const confirmedDate = this.dateUtil.convertDate(confirmedUnit.date);
    const confirmedTime = confirmedUnit.time
      ? `${confirmedUnit.time.slice(0, 5)}`
      : '종일';

    // 4. 메일 전송 대상 준비
    const clientUrl = this.configService.get('manna.clientUrl');
    const emailTargets = participants
      .filter((p) => p.participation_times.length > 0)
      .map((participant) => ({
        participant,
        email: this.commonUtil.decrypt(participant.email),
      }))
      .filter((target) => target.email);


    if (emailTargets.length === 0) {
      throw new BadRequestException('메일을 전송할 대상이 없습니다.');
    }

    // 5. 병렬 메일 전송
    const emailPromises = emailTargets.map(async (target) => {
      const success = await this.emailService.sendConfirmationEmail({
        participantName: target.participant.name,
        participantEmail: target.email,
        hostName: schedule.user.name,
        meetingTitle: schedule.name,
        confirmedDate,
        confirmedTime,
        meetingLocation: schedule.detail_address || '',
        joinLink: `${clientUrl}/schedule/${schedule.code}`,
      });

      return {
        participant_no: target.participant.no,
        name: target.participant.name,
        email: target.email,
        success,
      };
    });

    const results = await Promise.allSettled(emailPromises);

    // 6. 결과 집계
    const successList: { participant_no: number; name: string }[] = [];
    const failedList: { participant_no: number; name: string; email: string }[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successList.push({
            participant_no: result.value.participant_no,
            name: result.value.name,
          });
          // 메일 전송 플래그 업데이트
          await this.scheduleParticipantsRepository.update({
            where: { no: result.value.participant_no },
            data: { is_confirmation_mail_sent: true },
          });
        } else {
          failedList.push({
            participant_no: result.value.participant_no,
            name: result.value.name,
            email: result.value.email,
          });
        }
      } else {
        // Promise 자체가 reject된 경우
        failedList.push({
          participant_no: 0,
          name: 'Unknown',
          email: 'Unknown',
        });
      }
    }

    return {
      success_count: successList.length,
      failed_count: failedList.length,
      failed_list: failedList,
    };
  }

  /**
   * 실시간 랭킹 조회
   * @method
   */
  async getRealTimeRanking() {
    const start_date = this.dateUtil.dayjs().add(-7, 'day').toISOString();

    const end_date = this.dateUtil.dayjs().add(1, 'day').toISOString();

    // 1. 일주일 내 생성된 일정
    const schedule_count = await this.schedulesRepository.getCount({
      where: {
        create_datetime: { gte: start_date, lte: end_date },
        delete_datetime: null,
      },
    });
    // 2. 일주일 내 응답자 수
    const participant_count =
      await this.scheduleParticipantsRepository.getCount({
        where: {
          create_datetime: { gte: start_date, lte: end_date },
          delete_datetime: null,
        },
      });
    // 3. 현재까지 누적 일정 수
    const schedule_total_count = await this.schedulesRepository.getCount({
      where: {
        delete_datetime: null,
      },
    });

    return {
      schedule_count,
      participant_count,
      schedule_total_count,
    };
  }
}
