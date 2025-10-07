import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";
import * as assignmentSchema from "./schema-assignments";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...assignmentSchema,
  },
});

export type Database = typeof db;
