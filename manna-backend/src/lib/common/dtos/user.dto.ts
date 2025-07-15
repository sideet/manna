import { Users } from '@prisma/client';
import { convertDateTime } from 'src/lib/common/prototypes/date';

export class UserDTO {
  user_no: number;
  email: string;
  name: string;
  nickname: string | null;
  phone: string;
  enabled: boolean;
  create_datetime: Date | String;
  update_datetime: Date | String;
  delete_datetime: Date | null;

  constructor(user: Users) {
    this.user_no = user.no;
    this.email = user.email;
    this.nickname = user.nickname;
    this.name = user.name;
    this.phone = user.phone;
    this.enabled = user.enabled;
    this.create_datetime = convertDateTime(user.create_datetime);
    this.update_datetime = convertDateTime(user.update_datetime);
  }
}
