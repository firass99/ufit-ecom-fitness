import { Controller, Get, Query } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ===============================
  // USERS ANALYTICS
  // ===============================

  @Get('/users')
  getTotalUsers() {
    return this.analyticsService.getTotalUsers();
  }

  @Get('/users/roles/distribution')
  getUsersByRole() {
    return this.analyticsService.getUsersByRole();
  }

  @Get('/users/status/distribution')
  getActiveInactiveUsers() {
    return this.analyticsService.getActiveInactiveUsers();
  }

  @Get('/users/created')
  getNewUsersByMonths(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('beforeDays') beforeDays?: string,
  ) {
    return this.analyticsService.getNewUsersByMonths(
      months,
      startDate,
      beforeDays,
    );
  }

  // ===============================
  // PRODUCTS ANALYTICS
  // ===============================

  @Get('/products/top-categories')
  getTopProductCategories() {
    return this.analyticsService.getTopProductCategories();
  }

  @Get('/products')
  getTotalProducts() {
    return this.analyticsService.getTotalProducts();
  }

  @Get('/products/status/distribution')
  getProductsAvailability() {
    return this.analyticsService.getProductsAvailability();
  }

  @Get('/products/categories/distribution')
  getProductsByCategory() {
    return this.analyticsService.getProductsByCategory();
  }

  @Get('/products/created')
  getProductsCreatedByMonth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('beforeDays') beforeDays?: string,
  ) {
    return this.analyticsService.getProductsCreatedByMonth(
      months,
      startDate,
      beforeDays,
    );
  }

  // ===============================
  // ORDERS ANALYTICS
  // ===============================

  @Get('/orders')
  getTotalOrders() {
    return this.analyticsService.getTotalOrders();
  }

  @Get('/orders/revenue')
  getTotalRevenue() {
    return this.analyticsService.getTotalRevenue();
  }

  @Get('/orders/top-products')
  getTopSellingProducts(@Query('limit') limit?: string) {
    return this.analyticsService.getTopSellingProducts(
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('/orders/status/distribution')
  getOrderStatusDistribution() {
    return this.analyticsService.getOrderStatusDistribution();
  }

  @Get('/orders/created')
  getOrdersCreatedByMonth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('beforeDays') beforeDays?: string,
  ) {
    return this.analyticsService.getOrdersCreatedByMonth(
      months,
      startDate,
      beforeDays,
    );
  }

  // ===============================
  // CATEGORIES ANALYTICS
  // ===============================

  @Get('/categories')
  getTotalCategories() {
    return this.analyticsService.getTotalCategories();
  }

  @Get('/categories/products/distribution')
  getProductsPerCategory() {
    return this.analyticsService.getProductsPerCategory();
  }

  @Get('/categories/top-sales')
  getTopCategoriesBySales(@Query('limit') limit?: string) {
    return this.analyticsService.getTopCategoriesBySales(
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('/categories/revenue/distribution')
  getRevenueByCategories() {
    return this.analyticsService.getCategoriesRevenuesDistribution();
  }

  @Get('/categories/created')
  getCategoriesCreatedByMonth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('beforeDays') beforeDays?: string,
  ) {
    return this.analyticsService.getCategoriesCreatedByMonth(
      months,
      startDate,
      beforeDays,
    );
  }
  // ===============================
  // PROMOTIONS ANALYTICS
  // ===============================

  @Get('/promotions')
  getTotalPromotions() {
    return this.analyticsService.getTotalPromotions();
  }

  @Get('/promotions/status')
  getActiveExpiredPromotions() {
    return this.analyticsService.getActiveExpiredPromotions();
  }

  @Get('/promotions/types/distribution')
  getPromotionsByType() {
    return this.analyticsService.getPromotionsByType();
  }

  @Get('/promotions/top')
  getTopPromosUsed(@Query('limit') limit?: string) {
    return this.analyticsService.getTopPromosUsed(limit ? parseInt(limit) : 1);
  }
  @Get('/promotions/created')
  getPromotionsCreatedByMonth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('beforeDays') beforeDays?: string,
  ) {
    return this.analyticsService.getPromotionsCreatedByMonth(
      months,
      startDate,
      beforeDays,
    );
  }
  // ===============================
  // BRANDS ANALYTICS
  // ===============================

  @Get('/brands')
  getTotalBrands() {
    return this.analyticsService.getTotalBrands();
  }

  @Get('/brands/quantity/distribution')
  getBrandsWithWithoutProducts() {
    return this.analyticsService.getBrandsQuantityDistribution();
  }

  @Get('/brands/products/distribution')
  getTopBrandsByProductCount(@Query('limit') limit?: string) {
    return this.analyticsService.getTopBrandsProductsDistribution(
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('/brands/created')
  getBrandsCreatedByMonth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('beforeDays') beforeDays?: string,
  ) {
    return this.analyticsService.getBrandsCreatedByMonth(
      months,
      startDate,
      beforeDays,
    );
  }
}
