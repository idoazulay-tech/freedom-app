import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Parse connection string
// Format: mysql://user:password@host:port/database?ssl=...
const url = new URL(connectionString);
const config = {
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.split('/')[1],
  ssl: url.searchParams.has('ssl') ? JSON.parse(url.searchParams.get('ssl')) : true,
};

console.log('🔌 Connecting to database...');
console.log(`   Host: ${config.host}`);
console.log(`   Database: ${config.database}`);

const sql = `
-- Create diagnoses table for professional diagnosis wizard
CREATE TABLE IF NOT EXISTS \`diagnoses\` (
  \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`userId\` int NOT NULL,
  \`totalRiskScore\` int NOT NULL,
  \`riskLevel\` varchar(50) NOT NULL,
  \`totalDebt\` int NOT NULL,
  \`monthlyIncome\` int DEFAULT 0,
  \`monthlyExpenses\` int DEFAULT 0,
  \`availableForDebt\` int DEFAULT 0,
  \`creditorCount\` int DEFAULT 0,
  \`hasEnforcement\` boolean DEFAULT false,
  \`hasWarningLetters\` boolean DEFAULT false,
  \`debtsData\` text,
  \`actionsData\` text,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  \`updatedAt\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for userId for faster queries
CREATE INDEX IF NOT EXISTS \`idx_diagnoses_userId\` ON \`diagnoses\` (\`userId\`);
`;

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      console.log(`\n📝 Executing: ${statement.substring(0, 50)}...`);
      try {
        await connection.execute(statement);
        console.log('✅ Success');
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Table already exists (skipping)');
        } else if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Index already exists (skipping)');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 diagnoses table is now ready to use');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
