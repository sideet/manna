export interface UserType {
  no: number;
  email: string;
  name: string;
  nickname?: string | null;
  phone: string;
  enabled: boolean;
  create_datetime: string;
  update_datetime: string | null;
  delete_datetime: string | null;
}
