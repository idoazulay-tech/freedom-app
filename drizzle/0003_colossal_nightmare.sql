CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` varchar(100) NOT NULL,
	`categoryName` varchar(255) NOT NULL,
	`categoryGroup` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`isRecurring` boolean DEFAULT false,
	`recurringFrequency` enum('daily','weekly','biweekly','monthly','quarterly','yearly'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`stripePaymentIntentId` varchar(255),
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'ILS',
	`status` enum('pending','succeeded','failed','cancelled','refunded') NOT NULL,
	`paymentMethod` varchar(100),
	`description` text,
	`errorMessage` text,
	`receiptUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','premium') NOT NULL DEFAULT 'free',
	`status` enum('active','inactive','cancelled','suspended') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`maxDebts` int DEFAULT 2,
	`maxExpenseCategories` int DEFAULT 10,
	`features` json,
	`billingCycleStart` timestamp,
	`billingCycleEnd` timestamp,
	`nextBillingDate` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
