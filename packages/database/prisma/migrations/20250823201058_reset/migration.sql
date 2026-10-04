/*
  Warnings:

  - You are about to drop the column `currency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `promoId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `isOnSale` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `saleEndAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `saleStartAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ExchangeRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductPrice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantPrice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_promoId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPrice" DROP CONSTRAINT "ProductPrice_productId_fkey";

-- DropForeignKey
ALTER TABLE "VariantPrice" DROP CONSTRAINT "VariantPrice_variantId_fkey";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "currency",
DROP COLUMN "promoId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "currency",
DROP COLUMN "unitPrice",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isOnSale",
DROP COLUMN "saleEndAt",
DROP COLUMN "saleStartAt";

-- DropTable
DROP TABLE "ExchangeRate";

-- DropTable
DROP TABLE "ProductPrice";

-- DropTable
DROP TABLE "Promo";

-- DropTable
DROP TABLE "VariantPrice";

-- DropEnum
DROP TYPE "Currency";

-- DropEnum
DROP TYPE "DiscountType";
