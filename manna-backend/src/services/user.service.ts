import { BadRequestException, Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { SocialType } from 'src/lib/common/enums/user.enum';
import { CommonUtil } from 'src/lib/common/utils/common.util';
import { PrismaService } from 'src/lib/database/prisma.service';
import {
  ParticipationTimesRepository,
  ScheduleParticipantsRepository,
  ScheduleUnitsRepository,
  SchedulesRepository,
  UsersRepository,
} from 'src/lib/database/repositories';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly schedulesRepository: SchedulesRepository,
    private readonly scheduleUnitsRepository: ScheduleUnitsRepository,
    private readonly participationTimesRepository: ParticipationTimesRepository,
    private readonly scheduleParticipantsRepository: ScheduleParticipantsRepository,
    private readonly commonUtil: CommonUtil,
    private readonly prisma: PrismaService
  ) {}

  async getUser({ email }) {
    const user = await this.usersRepository.get({ where: { email } });
    const decrypt_phone = this.commonUtil.decrypt(user.phone);
    const decrypt_email = this.commonUtil.decrypt(user.email);

    return { ...user, phone: decrypt_phone, email: decrypt_email };
  }

  async createUser({
    email,
    password,
    name,
    phone,
    nickname,
  }: {
    email: string;
    password: string;
    name: string;
    social_type?: SocialType | null;
    phone?: string;
    nickname?: string;
  }) {
    const user = await this.usersRepository.get({
      where: { email: email },
    });
    if (user) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    // 비밀번호 해싱
    const hash_password = await this.commonUtil.bcrypt(password);

    password = hash_password;

    const create_user = await this.usersRepository.create({
      data: {
        email,
        password: hash_password,
        name,
        phone,
      },
    });

    return {
      email: create_user.email,
      name: create_user.name,
    };
  }

  /**
   * 회원 탈퇴
   * @method
   */
  async deleteUser(user_no: number): Promise<Users> {
    const user = await this.usersRepository.get({ where: { no: user_no } });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }

    const schedules = await this.schedulesRepository.gets({
      where: { user: { no: user_no } },
      include: { schedule_participants: true },
    });
    const schedule_units = await this.scheduleUnitsRepository.gets({
      where: { schedule: { no: { in: schedules.map((el) => el.no) } } },
      include: {
        participation_times: {
          include: {
            schedule_participant: true,
          },
        },
      },
    });
    const schedule_participants =
      await this.scheduleParticipantsRepository.gets({
        where: { schedule: { no: { in: schedules.map((el) => el.no) } } },
      });
    const participation_times = await this.participationTimesRepository.gets({
      where: {
        schedule_unit: { no: { in: schedule_units.map((el) => el.no) } },
      },
    });

    const now = new Date();

    await this.prisma.$transaction(async (connection) => {
      if (participation_times.length > 0) {
        // 일정 응답 삭제
        await this.participationTimesRepository.delete(
          {
            where: {
              no: {
                in: participation_times.map((el) => el.no),
              },
            },
          },
          connection
        );
      }

      if (schedule_participants.length > 0) {
        // 일정 참여자 삭제
        await this.scheduleParticipantsRepository.delete(
          {
            where: {
              no: {
                in: schedule_participants.map((el) => el.no),
              },
            },
          },
          connection
        );
      }

      if (schedule_units.length > 0) {
        // 일정 단위 삭제
        await this.scheduleUnitsRepository.delete(
          {
            where: {
              no: {
                in: schedule_units.map((el) => el.no),
              },
            },
          },
          connection
        );
      }

      if (schedules.length > 0) {
        // 일정 삭제
        await this.schedulesRepository.delete(
          {
            where: {
              no: {
                in: schedules.map((el) => el.no),
              },
            },
          },
          connection
        );
      }

      await this.usersRepository.update(
        {
          where: { no: user_no },
          data: { enabled: false, delete_datetime: now },
        },
        connection
      );
    });

    return;
  }
}
