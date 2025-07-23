import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { CommonUtil } from 'src/lib/common/utils/common.util';
import { UsersRepository } from 'src/lib/database/repositories';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly commonUtil: CommonUtil
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
    const encrypt_email = this.commonUtil.encrypt(signup_info.email);
    const encrypt_phone = this.commonUtil.encrypt(signup_info.phone);

    signup_info.email = encrypt_email;
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

    return await this.usersRepository.update({ where: { no: user_no }, data: { enabled: false, delete_datetime: '' } });
  }
}
