import postgres from "postgres";
import { POSTGRES_BOOTSTRAP_STATEMENTS } from "../lib/db/postgres-schema-statements.js";

type QuizMode = "romance" | "friendship";

const DATABASE_URL_ENV_BY_MODE: Record<QuizMode, string> = {
  romance: "ROMANCE_DATABASE_URL",
  friendship: "FRIENDSHIP_DATABASE_URL",
};

function resolveTargetModes(): QuizMode[] {
  const requestedMode = process.argv[2]?.trim();

  if (!requestedMode) {
    return ["romance", "friendship"];
  }

  if (requestedMode === "romance" || requestedMode === "friendship") {
    return [requestedMode];
  }

  throw new Error(`Unsupported mode "${requestedMode}". Use "romance" or "friendship".`);
}

function getRequiredDatabaseUrl(mode: QuizMode) {
  const envKey = DATABASE_URL_ENV_BY_MODE[mode];
  const value = process.env[envKey]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }

  return value;
}

async function bootstrapMode(mode: QuizMode) {
  const connectionString = getRequiredDatabaseUrl(mode);
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  try {
    for (const statement of POSTGRES_BOOTSTRAP_STATEMENTS) {
      await sql.unsafe(statement);
    }

    console.log(`[${mode}] PostgreSQL schema initialized.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main() {
  const modes = resolveTargetModes();

  for (const mode of modes) {
    await bootstrapMode(mode);
  }
}

main().catch((error) => {
  console.error("Failed to initialize PostgreSQL schema:", error);
  process.exitCode = 1;
});
