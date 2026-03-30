CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`actionType` varchar(100) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` varchar(255),
	`actionDetails` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`result` enum('success','failure','denied') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`debtProfileId` int NOT NULL,
	`professionalUserId` int,
	`status` enum('open','in_progress','closed','on_hold') DEFAULT 'open',
	`matchingScore` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentType` enum('data_processing','ai_analysis','professional_sharing','communication') NOT NULL,
	`consentGiven` boolean NOT NULL,
	`consentText` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalDebtAmount` decimal(15,2) NOT NULL,
	`debtType` enum('bank','credit_card','personal_loan','mortgage','tax','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`persona` enum('yossi','dana','avi') NOT NULL,
	`status` enum('new','in_progress','resolved','archived') DEFAULT 'new',
	`triageCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debt_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`uploadedByUserId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100),
	`fileSizeBytes` int,
	`encryptionAlgorithm` varchar(50) DEFAULT 'AES-256',
	`encryptionKeyId` varchar(255),
	`documentType` enum('contract','statement','letter','agreement','other'),
	`ocrProcessed` boolean DEFAULT false,
	`extractedText` longtext,
	`aiSummary` longtext,
	`extractedTasks` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` enum('task_assigned','document_uploaded','case_update','reminder','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedCaseId` int,
	`relatedTaskId` int,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`deliveryChannel` enum('in_app','email','whatsapp') DEFAULT 'in_app',
	`deliveryStatus` enum('pending','sent','delivered','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professional_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`specializations` json,
	`licenseNumber` varchar(255),
	`yearsOfExperience` int,
	`bio` text,
	`hourlyRate` decimal(10,2),
	`isVerified` boolean DEFAULT false,
	`verificationDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professional_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`assignedToUserId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','blocked') DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('debtor','professional','admin') NOT NULL DEFAULT 'debtor';--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('individual','professional') DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `webauthnCredentials` longtext;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` varchar(255);