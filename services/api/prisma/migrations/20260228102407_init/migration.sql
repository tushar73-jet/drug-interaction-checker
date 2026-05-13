-- CreateTable
CREATE TABLE "DrugInteraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "drug1" TEXT NOT NULL,
    "drug2" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "DrugInteraction_drug1_idx" ON "DrugInteraction"("drug1");

-- CreateIndex
CREATE INDEX "DrugInteraction_drug2_idx" ON "DrugInteraction"("drug2");
