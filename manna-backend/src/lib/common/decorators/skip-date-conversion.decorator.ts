import { SetMetadata } from '@nestjs/common';

export const DATE_CONVERSION = 'skipDateConversion';
export const DateConversion = () => SetMetadata(DATE_CONVERSION, true);
