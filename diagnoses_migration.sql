-- Create diagnoses table for professional diagnosis wizard
CREATE TABLE IF NOT EXISTS `diagnoses` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `totalRiskScore` int NOT NULL,
  `riskLevel` varchar(50) NOT NULL,
  `totalDebt` int NOT NULL,
  `monthlyIncome` int DEFAULT 0,
  `monthlyExpenses` int DEFAULT 0,
  `availableForDebt` int DEFAULT 0,
  `creditorCount` int DEFAULT 0,
  `hasEnforcement` boolean DEFAULT false,
  `hasWarningLetters` boolean DEFAULT false,
  `debtsData` text,
  `actionsData` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for userId for faster queries
CREATE INDEX IF NOT EXISTS `idx_diagnoses_userId` ON `diagnoses` (`userId`);
