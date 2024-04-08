-- CreateTable
CREATE TABLE "BranchProjection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countCommits" INTEGER NOT NULL,

    CONSTRAINT "BranchProjection_pkey" PRIMARY KEY ("id")
);
