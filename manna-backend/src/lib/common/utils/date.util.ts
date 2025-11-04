import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/ko';
import { Injectable } from '@nestjs/common';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(localeData);

dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');

@Injectable()
export class DateUtil {
  dayjs = dayjs.tz;
  constructor() {}

  convertDateTime(date: Date | string | null) {
    if (!date) return date;

    const result = this.dayjs(date)
      .tz('Asia/Seoul')
      .format('YYYY-MM-DD HH:mm:ss');

    return result;
  }

  convertDate(date: Date | string) {
    const result = this.dayjs(date).tz('Asia/Seoul').format('YYYY-MM-DD');

    return result;
  }

  convertData(data: Date | string) {
    if (!data && data === null) return data;

    if (data instanceof Date) {
      return this.convertDateTime(data);
    }

    if (Array.isArray(data)) {
      return data.map((value) => this.convertData(value));
    }

    if (typeof data === 'object') {
      const output: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, any>)) {
        output[key] = this.convertData(value);
      }
      return output;
    }

    return data;
  }
}
