/*
  Warnings:

  - You are about to drop the column `ibanNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studentIds` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `walletBalance` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobile]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mobile` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_phoneNumber_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "ibanNumber",
DROP COLUMN "phoneNumber",
DROP COLUMN "studentIds",
DROP COLUMN "walletBalance",
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockUntil" TIMESTAMP(3),
ADD COLUMN     "mobile" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_ids" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ibans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ibanNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ibans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_codes_mobile_idx" ON "otp_codes"("mobile");

-- CreateIndex
CREATE INDEX "otp_codes_expiresAt_idx" ON "otp_codes"("expiresAt");

-- CreateIndex
CREATE INDEX "student_ids_userId_idx" ON "student_ids"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_ids_userId_studentNumber_key" ON "student_ids"("userId", "studentNumber");

-- CreateIndex
CREATE INDEX "ibans_userId_idx" ON "ibans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ibans_userId_ibanNumber_key" ON "ibans"("userId", "ibanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_ids" ADD CONSTRAINT "student_ids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibans" ADD CONSTRAINT "ibans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
