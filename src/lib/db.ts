import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// DATABASE_URL is used by the pg pool that backs Prisma's PostgreSQL adapter.
const connectionString = process.env.DATABASE_URL;

// The pool owns database connections for all Prisma calls in this server process.
const pool = new Pool({ connectionString });

// Prisma 7 uses the adapter to talk to PostgreSQL through the pg driver.
const adapter = new PrismaPg(pool);

// Export a single Prisma client instance for API routes and services.
const prisma = new PrismaClient({ adapter });

export default prisma
