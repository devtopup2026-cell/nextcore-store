import dotenv from "dotenv";
import pg from "pg";

dotenv.config({
  path: ".env.local",
});

const { Client } = pg;

async function checkDatabase(name: string, connectionString?: string) {
  if (!connectionString) {
    throw new Error(`${name} URL not found`);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        current_database(),
        current_user,
        inet_server_addr(),
        inet_server_port()
    `);

    console.log(`\n✅ ${name} connected`);
    console.log(result.rows[0]);
  } finally {
    await client.end();
  }
}

async function main() {
  await checkDatabase("MAIN DATABASE", process.env.DATABASE_URL);
  await checkDatabase("SHADOW DATABASE", process.env.SHADOW_DATABASE_URL);
}

main().catch((error) => {
  console.error("❌ Connection test failed");
  console.error(error);
});