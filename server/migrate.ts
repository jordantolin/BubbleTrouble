import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
type DatabaseInstance = InstanceType<typeof Database>;
import { join } from 'path';
import * as schema from '@shared/schema';

const DB_PATH = join(process.cwd(), 'sqlite.db');
const MIGRATIONS_PATH = join(process.cwd(), 'drizzle');

async function main() {
  console.log('Starting database migration...');
  console.log(`Database path: ${DB_PATH}`);
  console.log(`Migrations path: ${MIGRATIONS_PATH}`);

  let sqlite: Database.Database;

  try {
    sqlite = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });

    // Enable foreign keys
    sqlite.exec('PRAGMA foreign_keys = ON');

    const db = drizzle(sqlite, { schema });

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: MIGRATIONS_PATH });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (sqlite) {
      console.log('Closing database connection...');
      sqlite.close();
    }
  }

  process.exit(0);
}

// Run migrations
main().catch((error) => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});
