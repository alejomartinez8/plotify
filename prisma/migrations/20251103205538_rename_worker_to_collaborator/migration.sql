-- Drop existing worker tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS "worker_assignments";
DROP TABLE IF EXISTS "workers";

-- CreateTable
CREATE TABLE "collaborators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoFileId" TEXT,
    "photoFileName" TEXT,
    "photoFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaborator_assignments" (
    "collaboratorId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaborator_assignments_pkey" PRIMARY KEY ("collaboratorId","lotId")
);

-- AddForeignKey
ALTER TABLE "collaborator_assignments" ADD CONSTRAINT "collaborator_assignments_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator_assignments" ADD CONSTRAINT "collaborator_assignments_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
