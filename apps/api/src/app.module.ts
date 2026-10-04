import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { MulterModule } from './multer/multer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CartsModule } from './carts/carts.module';
import { CoachsModule } from './coachs/coachs.module';
import { AthletesModule } from './athletes/athletes.module';
import { NutritionistsModule } from './nutritionists/nutritionists.module';
import googleOauthConfig from './auth/configs/google-oauth.config';
import jwtConfig from './auth/configs/jwt.config';
import refreshJwtConfig from './auth/configs/refreshJwt.config';
import { MeilisearchModule } from './meilisearch/meilisearch.module';
import { SessionsModule } from './sessions/sessions.module';
import { BrandsModule } from './brands/brands.module';
import { PromotionsModule } from './promotions/promotions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { validateEnv } from './config/env.validation';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      expandVariables: true,
      load: [googleOauthConfig, jwtConfig, refreshJwtConfig], //load config file
      validate: validateEnv,
    }),
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    MulterModule,
    CartsModule,
    CoachsModule,
    AthletesModule,
    NutritionistsModule,
    MeilisearchModule,
    SessionsModule,
    BrandsModule,
    PromotionsModule,
    AnalyticsModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
  exports: [AppService],
})
export class AppModule {}
