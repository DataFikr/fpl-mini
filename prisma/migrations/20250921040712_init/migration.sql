-- CreateTable
CREATE TABLE "public"."teams" (
    "id" SERIAL NOT NULL,
    "fplId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "managerName" TEXT NOT NULL,
    "crestUrl" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leagues" (
    "id" SERIAL NOT NULL,
    "fplId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "currentGameweek" INTEGER NOT NULL DEFAULT 1,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."league_teams" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "leagueId" INTEGER NOT NULL,

    CONSTRAINT "league_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gameweek_data" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "squad" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gameweek_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_crests" (
    "id" SERIAL NOT NULL,
    "teamName" TEXT NOT NULL,
    "crestUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_crests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."newsletter_subscriptions" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSentAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_fplId_key" ON "public"."teams"("fplId");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_fplId_key" ON "public"."leagues"("fplId");

-- CreateIndex
CREATE UNIQUE INDEX "league_teams_teamId_leagueId_key" ON "public"."league_teams"("teamId", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "gameweek_data_teamId_gameweek_key" ON "public"."gameweek_data"("teamId", "gameweek");

-- CreateIndex
CREATE UNIQUE INDEX "team_crests_teamName_key" ON "public"."team_crests"("teamName");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_leagueId_key" ON "public"."newsletter_subscriptions"("email", "leagueId");

-- AddForeignKey
ALTER TABLE "public"."league_teams" ADD CONSTRAINT "league_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."league_teams" ADD CONSTRAINT "league_teams_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gameweek_data" ADD CONSTRAINT "gameweek_data_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
