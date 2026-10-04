// config/multer.config.ts
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { existsSync, mkdirSync } from 'fs';

function sanitizeFileName(originalName: string) {
  const name = basename(originalName, extname(originalName));
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

export function generateMulterConfig(subfolder: string) {
  const uploadPath = join(__dirname, '..', '..', '..', 'uploads', subfolder);

  // Ensure the directory exists
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: uploadPath,
      filename: (req, file, callback) => {
        const sanitizedBase = sanitizeFileName(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(
          null,
          `${sanitizedBase}-${uniqueSuffix}${extname(file.originalname)}`,
        );
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedExt = /\.(jpg|jpeg|png|gif)$/i;
      if (!allowedExt.test(file.originalname)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  };
}
