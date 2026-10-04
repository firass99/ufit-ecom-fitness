import { Delete, Query } from '@nestjs/common';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateMulterConfig } from './config/multer.config';

@Controller('uploads')
export class MulterController {
  @Post()
  @UseInterceptors(FileInterceptor('file', generateMulterConfig('')))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      url: `${process.env.APP_URL}/uploads/${file.filename}`,
    };
  }

  @Post('categories')
  @UseInterceptors(FileInterceptor('file', generateMulterConfig('categories')))
  async uploadCategoriesFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      url: `${process.env.APP_URL}/uploads/categories/${file.filename}`,
    };
  }

  @Post('products')
  @UseInterceptors(FileInterceptor('file', generateMulterConfig('products')))
  async uploadProductsFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      url: `${process.env.APP_URL}/uploads/products/${file.filename}`,
    };
  }

  @Post('brands')
  @UseInterceptors(FileInterceptor('file', generateMulterConfig('brands')))
  async uploadBrandssFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      url: `${process.env.APP_URL}/uploads/brands/${file.filename}`,
    };
  }

  @Delete()
  async removeFile(@Query('path') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('Missing file path');
    }

    // Sanitize and validate path
    const basePath = join(__dirname, '..', '..', '..', 'uploads');
    const fullPath = join(basePath, filePath);

    if (!fullPath.startsWith(basePath)) {
      throw new BadRequestException('Invalid file path');
    }

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      return { success: true };
    }

    throw new BadRequestException('File not found');
  }
}
