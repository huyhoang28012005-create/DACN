import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => {
        const uploadDir = join(__dirname, '..', '..', 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        return {
          storage: diskStorage({
            destination: (req, file, cb) => {
              cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
              const uniqueSuffix = uuidv4();
              const ext = extname(file.originalname);
              cb(null, `${uniqueSuffix}${ext}`);
            },
          }),
          limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
          },
        };
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
