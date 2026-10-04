// analytics.service.ts
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
  subDays,
  startOfDay,
  endOfDay,
} from 'date-fns';

import { Injectable } from '@nestjs/common';
import { PrismaClient, OrderStatus, DiscountType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  // --------------------------------------
  // USERS (already provided)
  // --------------------------------------

  async getTotalUsers() {
    return this.prisma.user.count();
  }

  async getUsersByRole() {
    const grouped = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return grouped.map((g) => ({
      role: g.role,
      count: g._count.role,
    }));
  }

  async getActiveInactiveUsers() {
    const [active, inactive] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
    ]);

    return { active, inactive };
  }

  async getNewUsersByMonths(
    months?: string,
    startDate?: string,
    beforeDays?: string,
  ) {
    const startFrom = startDate ? parseISO(startDate) : new Date();

    // --- If months provided ---
    if (months && parseInt(months) > 0) {
      const m = parseInt(months);
      const results = [];

      for (let i = m - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);

        const count = await this.prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        results.push({
          label: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
          count,
        });
      }

      return results;
    }

    // --- Else if days provided ---
    if (beforeDays && parseInt(beforeDays) > 0) {
      const d = parseInt(beforeDays);
      const results = [];

      for (let i = d - 1; i >= 0; i--) {
        const day = subDays(startFrom, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const count = await this.prisma.user.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        results.push({
          label: day.toLocaleDateString('default', {
            day: 'numeric',
            month: 'short',
          }),
          count,
        });
      }

      return results;
    }
  }

  // --------------------------------------
  // PRODUCTS
  // --------------------------------------
  async getTopProductCategories(limit = 5) {
    const cat_grouped = await this.prisma.category.groupBy({
      by: ['id', 'name'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const result = await Promise.all(
      cat_grouped.map(async (cat) => {
        const products = await this.prisma.product.findMany({
          where: { categoryId: cat.id },
        });

        return {
          label: cat.name || 'Unknown',
          value: products.length || 0,
        };
      }),
    );

    return result;
  }

  async getTotalProducts() {
    return this.prisma.product.count();
  }

  async getProductsAvailability() {
    const [available, outOfStock] = await Promise.all([
      this.prisma.product.count({ where: { isAvailable: true } }),
      this.prisma.product.count({ where: { isAvailable: false } }),
    ]);
    return { available, outOfStock };
  }

  async getProductsByCategory() {
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true },
    });

    const results = await Promise.all(
      categories.map(async (cat) => {
        const count = await this.prisma.product.count({
          where: { categoryId: cat.id },
        });
        return {
          id: cat.id,
          category: cat.name,
          count,
        };
      }),
    );

    return results;
  }

  /*   async getProductsCreatedByMonth(months?: string, startDate?: string, beforeDays?: string) {
      const startFrom = startDate ? parseISO(startDate) : new Date();
      const results = [];
  
      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);
  
        const count = await this.prisma.product.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });
  
        results.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          year: monthStart.getFullYear(),
          count,
        });
      }
  
      return results;
    }
   */

  async getProductsCreatedByMonth(
    months?: string,
    startDate?: string,
    beforeDays?: string,
  ) {
    const startFrom = startDate ? parseISO(startDate) : new Date();

    // --- 📅 MONTHLY MODE ---
    if (months && parseInt(months) > 0) {
      const m = parseInt(months);
      const results = [];

      for (let i = m - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);

        const count = await this.prisma.product.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        results.push({
          label: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
          count,
        });
      }

      return results;
    }

    // --- 📆 DAILY MODE ---
    if (beforeDays && parseInt(beforeDays) > 0) {
      const d = parseInt(beforeDays);
      const results = [];

      for (let i = d - 1; i >= 0; i--) {
        const day = subDays(startFrom, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const count = await this.prisma.product.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        results.push({
          label: day.toLocaleDateString('default', {
            day: 'numeric',
            month: 'short',
          }),
          count,
        });
      }

      return results;
    }
  }

  // --------------------------------------
  // ORDERS
  // --------------------------------------

  async getTotalOrders() {
    return this.prisma.order.count();
  }

  async getTotalRevenue() {
    const result = await this.prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: OrderStatus.DELIVERED },
    });

    return result._sum.totalPrice ?? 0;
  }

  async getTopSellingProducts(limit = 5) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: limit,
    });

    // ✅ Filter out null productId values
    const filtered = items.filter((item) => item.productId !== null);

    const results = await Promise.all(
      filtered.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId! },
          select: { name: true },
        });

        return {
          productId: item.productId!,
          name: product?.name ?? 'Unknown',
          totalSold: item._sum.quantity ?? 0,
        };
      }),
    );

    return results;
  }

  async getOrderStatusDistribution() {
    const statuses = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return statuses.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));
  }

  /*   async getOrdersCreatedByMonth(months?: string, startDate?: string, beforeDays?: string) {
      const startFrom = startDate ? parseISO(startDate) : new Date();
      const results = [];
  
      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);
  
        const count = await this.prisma.order.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });
  
        results.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          year: monthStart.getFullYear(),
          count,
        });
      }
  
      return results;
    } */

  async getOrdersCreatedByMonth(
    months?: string,
    startDate?: string,
    beforeDays?: string,
  ) {
    const startFrom = startDate ? parseISO(startDate) : new Date();

    // --- 📅 MONTHLY MODE ---
    if (months && parseInt(months) > 0) {
      const m = parseInt(months);
      const results = [];

      for (let i = m - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);

        const count = await this.prisma.order.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        results.push({
          label: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
          count,
        });
      }

      return results;
    }

    // --- 📆 DAILY MODE ---
    if (beforeDays && parseInt(beforeDays) > 0) {
      const d = parseInt(beforeDays);
      const results = [];

      for (let i = d - 1; i >= 0; i--) {
        const day = subDays(startFrom, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const count = await this.prisma.order.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        results.push({
          label: day.toLocaleDateString('default', {
            day: 'numeric',
            month: 'short',
          }),
          count,
        });
      }

      return results;
    }
  }

  // --------------------------------------
  // CATEGORIES
  // --------------------------------------

  async getTotalCategories() {
    return this.prisma.category.count();
  }

  async getProductsPerCategory() {
    return this.getProductsByCategory();
  }

  async getTopCategoriesBySales(limit = 5) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    const categoryMap: Record<string, number> = {};

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId! },
        select: { categoryId: true },
      });

      if (product?.categoryId) {
        categoryMap[product.categoryId] =
          (categoryMap[product.categoryId] || 0) + (item._sum.quantity || 0);
      }
    }

    const sorted = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const result = await Promise.all(
      sorted.map(async ([categoryId, count]) => {
        const cat = await this.prisma.category.findUnique({
          where: { id: categoryId },
        });
        return { category: cat?.name ?? 'Unknown', count };
      }),
    );

    return result;
  }

  async getCategoriesRevenuesDistribution() {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    const categoryMap: Record<string, number> = {};

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId! },
        select: { categoryId: true },
      });

      if (product?.categoryId) {
        categoryMap[product.categoryId] =
          (categoryMap[product.categoryId] || 0) + (item._sum.quantity || 0);
      }
    }

    const sorted = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0);
    //      .slice(0, limit);

    const result = await Promise.all(
      sorted.map(async ([categoryId, count]) => {
        const cat = await this.prisma.category.findUnique({
          where: { id: categoryId },
        });
        return { category: cat?.name ?? 'Unknown', count };
      }),
    );

    return result;
  }

  async getCategoriesCreatedByMonth(
    months?: string,
    startDate?: string,
    beforeDays?: string,
  ) {
    const startFrom = startDate ? parseISO(startDate) : new Date();

    // --- 📅 MONTHLY MODE ---
    if (months && parseInt(months) > 0) {
      const m = parseInt(months);
      const results = [];

      for (let i = m - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);

        const count = await this.prisma.category.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        results.push({
          label: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
          count,
        });
      }

      return results;
    }

    // --- 📆 DAILY MODE ---
    if (beforeDays && parseInt(beforeDays) > 0) {
      const d = parseInt(beforeDays);
      const results = [];

      for (let i = d - 1; i >= 0; i--) {
        const day = subDays(startFrom, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const count = await this.prisma.category.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        results.push({
          label: day.toLocaleDateString('default', {
            day: 'numeric',
            month: 'short',
          }),
          count,
        });
      }

      return results;
    }
  }

  // --------------------------------------
  // PROMOTIONS
  // --------------------------------------

  async getTotalPromotions() {
    return this.prisma.promo.count();
  }

  async getActiveExpiredPromotions() {
    const [active, expired] = await Promise.all([
      this.prisma.promo.count({ where: { isActive: true } }),
      this.prisma.promo.count({ where: { isActive: false } }),
    ]);
    return { active, expired };
  }

  async getPromotionsByType() {
    const grouped = await this.prisma.promo.groupBy({
      by: ['discountType'],
      _count: { discountType: true },
    });

    return grouped.map((g) => ({
      type: g.discountType,
      count: g._count.discountType,
    }));
  }

  async getTopPromosUsed(limit: number) {
    const promos = await this.prisma.promo.findMany({
      orderBy: { usedCount: 'desc' },
      take: limit,
    });

    return promos.map((p) => ({
      code: p.code,
      used: p.usedCount,
    }));
  }

  async getPromotionsCreatedByMonth(
    months?: string,
    startDate?: string,
    beforeDays?: string,
  ) {
    const startFrom = startDate ? parseISO(startDate) : new Date();

    // --- 📅 MONTHLY MODE ---
    if (months && parseInt(months) > 0) {
      const m = parseInt(months);
      const results = [];

      for (let i = m - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);

        const count = await this.prisma.promo.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        results.push({
          label: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
          count,
        });
      }

      return results;
    }

    // --- 📆 DAILY MODE ---
    if (beforeDays && parseInt(beforeDays) > 0) {
      const d = parseInt(beforeDays);
      const results = [];

      for (let i = d - 1; i >= 0; i--) {
        const day = subDays(startFrom, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const count = await this.prisma.promo.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        results.push({
          label: day.toLocaleDateString('default', {
            day: 'numeric',
            month: 'short',
          }),
          count,
        });
      }

      return results;
    }
  }

  // --------------------------------------
  // BRANDS
  // --------------------------------------

  async getTotalBrands() {
    return this.prisma.brand.count();
  }

  async getBrandsQuantityDistribution() {
    const brands = await this.prisma.brand.findMany({
      include: { products: true },
    });

    let withProducts = 0;
    let withoutProducts = 0;

    brands.forEach((b) => {
      if (b.products.length > 0) withProducts++;
      else withoutProducts++;
    });

    return { withProducts, withoutProducts };
  }

  async getTopBrandsProductsDistribution(limit: number) {
    const brands = await this.prisma.brand.findMany({
      include: { products: true },
    });

    return brands
      .map((b) => ({
        name: b.name,
        count: b.products.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getBrandsCreatedByMonth(
    months?: string,
    startDate?: string,
    beforeDays?: string,
  ) {
    const startFrom = startDate ? parseISO(startDate) : new Date();

    // --- 📅 MONTHLY MODE ---
    if (months && parseInt(months) > 0) {
      const m = parseInt(months);
      const results = [];

      for (let i = m - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(startFrom, i));
        const monthEnd = endOfMonth(monthStart);

        const count = await this.prisma.brand.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        results.push({
          label: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
          count,
        });
      }

      return results;
    }

    // --- 📆 DAILY MODE ---
    if (beforeDays && parseInt(beforeDays) > 0) {
      const d = parseInt(beforeDays);
      const results = [];

      for (let i = d - 1; i >= 0; i--) {
        const day = subDays(startFrom, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const count = await this.prisma.brand.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        results.push({
          label: day.toLocaleDateString('default', {
            day: 'numeric',
            month: 'short',
          }),
          count,
        });
      }

      return results;
    }
  }
}
