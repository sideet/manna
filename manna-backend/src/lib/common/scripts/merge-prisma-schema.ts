// scripts/merge-schema.ts
import fs from 'fs';
import path from 'path';

const base = fs.readFileSync('app/src/lib/database/prisma/base.prisma', 'utf-8');
const modelFiles = fs
  .readdirSync('app/src/lib/database/prisma/models')
  .filter((f) => f.endsWith('.prisma'))
  .map((file) => fs.readFileSync(path.join('app/src/lib/database/prisma/models', file), 'utf-8'))
  .join('\n\n');

fs.writeFileSync('app/src/lib/database/prisma/schema.prisma', base + '\n\n' + modelFiles);
console.log('✅ schema.prisma generated from models/');
