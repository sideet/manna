import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { CommonUtil } from 'src/lib/common/utils/common.util';
import { PrismaService } from 'src/lib/database/prisma.service';
import { ParticipationTimesRepository, ScheduleParticipantsRepository, ScheduleUnitsRepository, SchedulesRepository, UsersRepository } from 'src/lib/database/repositories';

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
    const user = await this.usersRepository.get({ email });
    const decrypt_phone = this.commonUtil.decrypt(user.phone);
    const decrypt_email = this.commonUtil.decrypt(user.email);

    return { ...user, phone: decrypt_phone, email: decrypt_email };
  }

  async login({ email, password }: { email: string; password: string }): Promise<Users | null> {
    const user = await this.usersRepository.get({ email });

    if (!user) throw new BadRequestException('잘못된 이메일, 비밀번호입니다.');

    if (!user.enabled) throw new BadRequestException('탈퇴한 회원정보입니다.');

    const is_password_match = await this.commonUtil.bcryptCompare(password, user.password);

    if (!is_password_match) throw new BadRequestException('잘못된 이메일, 비밀번호입니다.');

    const decrypt_phone = this.commonUtil.decrypt(user.phone);
    const decrypt_email = this.commonUtil.decrypt(user.email);

    return { ...user, phone: decrypt_phone, email: decrypt_email };
  }

  async createUser(signup_info: Prisma.UsersCreateInput): Promise<Users> {
    const user = await this.usersRepository.get({ email: signup_info.email });
    if (user) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    // 비밀번호 해싱
    const hash_password = await this.commonUtil.bcrypt(signup_info.password);

    signup_info.password = hash_password;

    // 이메일, 휴대폰번호 암호화
    // const encrypt_email = this.commonUtil.encrypt(signup_info.email);
    const encrypt_phone = this.commonUtil.encrypt(signup_info.phone);

    // signup_info.email = encrypt_email;
    signup_info.phone = encrypt_phone;

    return await this.usersRepository.create(signup_info);
  }

  /**
   * 회원 탈퇴
   * @method
   */
  async deleteUser(user_no: number): Promise<Users> {
    const user = await this.usersRepository.get({ no: user_no });
    if (!user) {
      throw new BadRequestException('존재하지 않는 회원입니다.');
    }

    const schedules = await this.schedulesRepository.gets({ user: { no: user_no } });
    const schedule_units = await this.scheduleUnitsRepository.gets({ schedule: { no: { in: schedules.map((el) => el.no) } } });
    const schedule_participants = await this.scheduleParticipantsRepository.gets({ where: { schedule: { no: { in: schedules.map((el) => el.no) } } } });
    const participation_times = await this.participationTimesRepository.gets({ schedule_unit: { no: { in: schedule_units.map((el) => el.no) } } });

    const now = new Date();

    await this.prisma.$transaction(async (connection) => {
      if (participation_times.length > 0) {
        // 일정 응답 삭제
        await this.participationTimesRepository.delete(
          {
            no: {
              in: participation_times.map((el) => el.no),
            },
          },
          connection
        );
      }

      if (schedule_participants.length > 0) {
        // 일정 참여자 삭제
        await this.scheduleParticipantsRepository.delete(
          {
            no: {
              in: schedule_participants.map((el) => el.no),
            },
          },
          connection
        );
      }

      if (schedule_units.length > 0) {
        // 일정 단위 삭제
        await this.scheduleUnitsRepository.delete(
          {
            no: {
              in: schedule_units.map((el) => el.no),
            },
          },
          connection
        );
      }

      if (schedules.length > 0) {
        // 일정 삭제
        await this.schedulesRepository.delete(
          {
            no: {
              in: schedules.map((el) => el.no),
            },
          },
          connection
        );
      }

      await this.usersRepository.update({ where: { no: user_no }, data: { enabled: false, delete_datetime: now } }, connection);
    });

    return;
  }
}
