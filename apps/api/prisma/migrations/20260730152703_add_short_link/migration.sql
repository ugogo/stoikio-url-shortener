-- CreateTable
CREATE TABLE "ShortLink" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "destination" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
