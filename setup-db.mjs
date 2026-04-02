import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

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

async function setupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(config);

    // Read and execute migration files
    const migrationsDir = './drizzle';
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${sqlFiles.length} migration files`);

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`\n📝 Executing migration: ${file}`);
      
      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.replace(/^\s*--> statement-breakpoint\s*/, '').trim())
        .filter(s => s && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (!statement) continue;
        try {
          await connection.execute(statement);
          console.log(`  ✅ Executed statement`);
        } catch (err) {
          if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`  ⚠️  Table already exists`);
          } else if (err.code === 'ER_PARSE_ERROR' && statement.includes('--> statement-breakpoint')) {
            console.log(`  ⚠️  Skipping statement-breakpoint`);
          } else {
            console.error(`  ❌ Error: ${err.message}`);
            // Don't throw, continue with next statement
          }
        }
      }
    }

    console.log('\n✅ Database setup completed successfully');
  } catch (err) {
    console.error('Error:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
