-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "teamId" TEXT,
    "marketValue" REAL NOT NULL DEFAULT 0,
    "performanceScore" REAL NOT NULL DEFAULT 0,
    "totalRaces" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalPodiums" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "nftTokenId" TEXT,
    "nftContractAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "drivers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "teamConstructor" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "budget" REAL NOT NULL DEFAULT 0,
    "sponsorValue" REAL NOT NULL DEFAULT 0,
    "nftTokenId" TEXT,
    "nftContractAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "raceName" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "raceDate" DATETIME NOT NULL,
    "position" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "fastestLap" BOOLEAN NOT NULL DEFAULT false,
    "polePosition" BOOLEAN NOT NULL DEFAULT false,
    "lapTime" TEXT,
    "gapToLeader" TEXT,
    "overtakes" INTEGER NOT NULL DEFAULT 0,
    "pitStops" INTEGER NOT NULL DEFAULT 0,
    "attested" BOOLEAN NOT NULL DEFAULT false,
    "attestationHash" TEXT,
    "attestedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "performance_metrics_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_driverId_raceId_key" ON "performance_metrics"("driverId", "raceId");
