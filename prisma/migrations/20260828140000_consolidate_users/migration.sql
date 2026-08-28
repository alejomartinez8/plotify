-- CreateTable: users (replaces the treasurers table; also backs the
-- Admin role, alongside the ADMIN_EMAILS env var kept as a safety net —
-- see docs/SPEC-USER-ROLES-CONSOLIDATION.md)
CREATE TABLE "users" (
  "id"        TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "name"      TEXT,
  "role"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key"
  ON "users"("email");

-- Migrate existing treasurers into users with role = 'treasurer'
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt")
SELECT "id", "email", "name", 'treasurer', "createdAt", "createdAt"
FROM "treasurers";

-- DropTable
DROP TABLE "treasurers";
