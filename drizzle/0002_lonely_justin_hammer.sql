CREATE TABLE `diagnoses` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagnoses_id` PRIMARY KEY(`id`)
);
