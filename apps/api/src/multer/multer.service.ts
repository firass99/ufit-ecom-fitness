import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MulterService {
  async deleteFile(filePath: string) {
    try {
      await unlink(join(process.cwd(), filePath));
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}
