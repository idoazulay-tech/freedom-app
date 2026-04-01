import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json, longtext } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["debtor", "professional", "admin"]).default("debtor").notNull(),
  userType: mysqlEnum("userType", ["individual", "professional"]).default("individual").notNull(),
  webauthnCredentials: longtext("webauthnCredentials"), // JSON array of WebAuthn credentials
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  twoFactorSecret: varchar("twoFactorSecret", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Override InsertUser to make userType optional for backward compatibility
export type InsertUserRequest = Omit<InsertUser, 'userType'> & { userType?: InsertUser['userType'] };

// Professional profiles table
export const professionalProfiles = mysqlTable("professional_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  specializations: json("specializations"), // ['lawyer', 'accountant', 'financial_advisor']
  licenseNumber: varchar("licenseNumber", { length: 255 }),
  yearsOfExperience: int("yearsOfExperience"),
  bio: text("bio"),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  isVerified: boolean("isVerified").default(false),
  verificationDate: timestamp("verificationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = typeof professionalProfiles.$inferInsert;

// Debt profiles / cases table
export const debtProfiles = mysqlTable("debt_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalDebtAmount: decimal("totalDebtAmount", { precision: 15, scale: 2 }).notNull(),
  debtType: mysqlEnum("debtType", ["bank", "credit_card", "personal_loan", "mortgage", "tax", "other"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  persona: mysqlEnum("persona", ["yossi", "dana", "avi"]).notNull(), // Yossi (early), Dana (advanced), Avi (critical)
  status: mysqlEnum("status", ["new", "in_progress", "resolved", "archived"]).default("new"),
  triageCompletedAt: timestamp("triageCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DebtProfile = typeof debtProfiles.$inferSelect;
export type InsertDebtProfile = typeof debtProfiles.$inferInsert;

// Cases table (linking debtors to professionals)
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  debtProfileId: int("debtProfileId").notNull(),
  professionalUserId: int("professionalUserId"),
  status: mysqlEnum("status", ["open", "in_progress", "closed", "on_hold"]).default("open"),
  matchingScore: decimal("matchingScore", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

// Documents table with encryption metadata
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  uploadedByUserId: int("uploadedByUserId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // Encrypted S3 URL
  mimeType: varchar("mimeType", { length: 100 }),
  fileSizeBytes: int("fileSizeBytes"),
  encryptionAlgorithm: varchar("encryptionAlgorithm", { length: 50 }).default("AES-256"),
  encryptionKeyId: varchar("encryptionKeyId", { length: 255 }),
  documentType: mysqlEnum("documentType", ["contract", "statement", "letter", "agreement", "other"]),
  ocrProcessed: boolean("ocrProcessed").default(false),
  extractedText: longtext("extractedText"), // Encrypted extracted text from OCR
  aiSummary: longtext("aiSummary"), // Encrypted AI summary
  extractedTasks: json("extractedTasks"), // Encrypted JSON array of extracted tasks
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// Tasks table
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  assignedToUserId: int("assignedToUserId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "blocked"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Consent records table (Privacy Law Amendment 13 compliance)
export const consentRecords = mysqlTable("consent_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consentType: mysqlEnum("consentType", ["data_processing", "ai_analysis", "professional_sharing", "communication"]).notNull(),
  consentGiven: boolean("consentGiven").notNull(),
  consentText: text("consentText"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = typeof consentRecords.$inferInsert;

// Audit logs table
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }),
  resourceId: varchar("resourceId", { length: 255 }),
  actionDetails: json("actionDetails"), // Non-sensitive operation metadata
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  result: mysqlEnum("result", ["success", "failure", "denied"]).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  notificationType: mysqlEnum("notificationType", ["task_assigned", "document_uploaded", "case_update", "reminder", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedCaseId: int("relatedCaseId"),
  relatedTaskId: int("relatedTaskId"),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  deliveryChannel: mysqlEnum("deliveryChannel", ["in_app", "email", "whatsapp"]).default("in_app"),
  deliveryStatus: mysqlEnum("deliveryStatus", ["pending", "sent", "delivered", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Diagnoses table
export const diagnoses = mysqlTable("diagnoses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalRiskScore: int("totalRiskScore").notNull(),
  riskLevel: varchar("riskLevel", { length: 50 }).notNull(),
  totalDebt: int("totalDebt").notNull(),
  monthlyIncome: int("monthlyIncome").default(0),
  monthlyExpenses: int("monthlyExpenses").default(0),
  availableForDebt: int("availableForDebt").default(0),
  creditorCount: int("creditorCount").default(0),
  hasEnforcement: boolean("hasEnforcement").default(false),
  hasWarningLetters: boolean("hasWarningLetters").default(false),
  debtsData: text("debtsData"),
  actionsData: text("actionsData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = typeof diagnoses.$inferInsert;
