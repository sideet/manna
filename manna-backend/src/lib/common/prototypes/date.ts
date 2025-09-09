import { DateTime } from 'luxon';

export const convertToZonedISODateTime = (date: Date | string) => {
  const result = DateTime.fromJSDate(new Date(date))
    .setZone('Asia/Seoul')
    .toFormat('yyyy-MM-dd HH:mm:ss');

  return result;
};

export const convertDate = (date: Date | string) => {
  const result = DateTime.fromJSDate(new Date(date))
    .setZone('Asia/Seoul')
    .toFormat('yyyy-MM-dd');

  return result;
};
