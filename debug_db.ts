import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load DATABASE_URL from the local .env file before creating database clients.
dotenv.config();

/**
 * main connects directly to PostgreSQL and Prisma for quick local diagnostics.
 * It verifies price columns with raw SQL, then confirms Prisma can read shipments.
 */
async function main() {
  // The debug pool uses the same DATABASE_URL as the app runtime.
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  // Prisma 7 talks to PostgreSQL through the adapter backed by the pg pool.
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Raw SQL checks the exact stored decimal values before Prisma maps them.
    const rawShipments = await pool.query('SELECT id, "proposedPrice", "approvedPrice" FROM "Shipment"');
    console.log("Prices in DB:");
    console.table(rawShipments.rows);

    // Prisma read verifies the generated client and relations are usable.
    console.log("Attempting findMany...");
    const shipments = await prisma.shipment.findMany({
      include: {
        sender: { select: { name: true } }
      }
    });
    console.log("findMany success! Found:", shipments.length);
  } catch (e) {
    console.error("Error debugging DB:", e);
  } finally {
    // Always close the pg pool so the script exits cleanly.
    await pool.end();
  }
}

// Run the diagnostic routine when this file is executed directly.
main();
