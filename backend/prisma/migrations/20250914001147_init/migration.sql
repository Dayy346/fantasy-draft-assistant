-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "team" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "att" INTEGER,
    "tgt" INTEGER,
    "rec" INTEGER,
    "rushYds" REAL,
    "recvYds" REAL,
    "totalTd" INTEGER,
    "fpts" REAL,
    "ppg" REAL,
    "touches" INTEGER,
    "ppt" REAL,
    "ypc" REAL,
    "ypr" REAL,
    "tpg" REAL,
    "oppg" REAL,
    "consistency" REAL,
    "snapShare" REAL,
    "ppgWeighted" REAL,
    "pptWeighted" REAL,
    "oppgWeighted" REAL,
    "ypcWeighted" REAL,
    "draftScore" REAL,
    "vorp" REAL,
    "isRookie" BOOLEAN DEFAULT false,
    "draftRound" INTEGER,
    "draftPick" INTEGER,
    "collegeYdsPg" REAL,
    "combineSpeed" REAL,
    "rookieScore" REAL,
    "rookiePpgProj" REAL,
    CONSTRAINT "Season_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
