import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
const maxAttempts = 30;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    console.log("Database is ready.");
    process.exit(0);
  } catch (error) {
    await client.end().catch(() => undefined);
    if (attempt === maxAttempts) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
