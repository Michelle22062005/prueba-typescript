import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

// Prisma CLI configuration for schema, migrations, and direct database access.
export default defineConfig({
  // Main Prisma schema that defines models, enums, and client generation.
  schema: "prisma/schema.prisma",
  migrations: {
    // Migration history lives in the standard Prisma migrations directory.
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL is used by migrations and other direct database operations.
    url: env("DIRECT_URL"),
  },
});
