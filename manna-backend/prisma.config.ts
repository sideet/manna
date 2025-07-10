import path from 'path';
import type { PrismaConfig } from 'prisma';
import { config } from 'dotenv';

export default {
  earlyAccess: true,
  schema: path.join(__dirname, 'src', 'lib', 'database', 'prisma', 'schema.prisma'),
} satisfies PrismaConfig;

const envFile = `.env.${process.env.NODE_ENV || 'local'}`;
config({ path: envFile });
