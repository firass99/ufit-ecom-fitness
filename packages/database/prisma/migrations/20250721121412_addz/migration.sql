-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isAvailable" BOOLEAN DEFAULT true,
ADD COLUMN     "stock" INTEGER DEFAULT 0;
