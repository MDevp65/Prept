-- CreateEnum
CREATE TYPE "WorkspaceMemberRole" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "role" "WorkspaceMemberRole" NOT NULL DEFAULT 'MEMBER';
