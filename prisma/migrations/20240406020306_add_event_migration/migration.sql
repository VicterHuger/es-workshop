-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "actor" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_streamId_idx" ON "events"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "events_version_streamId_key" ON "events"("version", "streamId");
