import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Use the DATABASE_URL environment variable if provided, otherwise fallback to local path
// For local development, ensuring "file:" prefix is handled if adapter expects raw path
const rawUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('file:./', '').replace('file:', '') : 'data/dev.db';

const adapter = new PrismaBetterSqlite3({ url: rawUrl });

const prisma = new PrismaClient({ adapter });

export default prisma;
