-- CreateTable
CREATE TABLE "monthly_maintenance_quotas" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "monthlyAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_maintenance_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_maintenance_quotas_year_key" ON "monthly_maintenance_quotas"("year");
