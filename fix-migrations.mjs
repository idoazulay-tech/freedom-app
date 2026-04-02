import mysql from 'mysql2/promise';
import { createSecureContext } from 'tls';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

// Parse connection string
const url = new URL(connectionString);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
  },
};

async function fixMigrations() {
  let connection;
  try {
    connection = await mysql.createConnection(config);

    // Create migrations table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`hash\` VARCHAR(255) NOT NULL UNIQUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert migration records
    const migrations = [
      '0000_sour_proteus',
      '0001_faulty_centennial',
      '0002_lonely_justin_hammer',
    ];

    for (const migration of migrations) {
      try {
        await connection.execute(
          'INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, NOW())',
          [migration]
        );
        console.log(`✅ Inserted migration: ${migration}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Migration already exists: ${migration}`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migration meta table updated successfully');
  } catch (err) {
    console.error('Error:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
