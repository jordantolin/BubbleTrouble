import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
type DatabaseInstance = InstanceType<typeof Database>;
import * as schema from "@shared/schema";
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'sqlite.db');

function createDatabase() {
  try {
    const sqlite = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });

    // Enable foreign keys
    sqlite.exec('PRAGMA foreign_keys = ON');

    // Enable WAL mode for better concurrency
    sqlite.exec('PRAGMA journal_mode = WAL');

    console.log(`SQLite database connected at ${DB_PATH}`);
    return sqlite;
  } catch (error) {
    console.error('Failed to connect to SQLite database:', error);
    process.exit(1);
  }
}

const sqlite = createDatabase();
export const db = drizzle(sqlite!, { schema });

// Graceful shutdown
function handleShutdown() {
  console.log('Closing database connection...');
  sqlite?.close();
  process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// Prevent unhandled promise rejections from crashing the app
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
