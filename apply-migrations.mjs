import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: 'Amazon RDS',
  });

  const db = drizzle(connection);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✅ Migrations completed successfully!');

  await connection.end();
};

runMigrations().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
