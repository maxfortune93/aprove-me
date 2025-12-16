/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `assignors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "assignors_document_key" ON "assignors"("document");
