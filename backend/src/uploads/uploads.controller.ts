import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uploads')
export class UploadsController {
  @Post()
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.TECHNICIAN, Role.STUDENT)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    // Kiểm tra định dạng (chỉ cho phép ảnh)
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      throw new BadRequestException(
        'Chỉ cho phép upload định dạng hình ảnh (jpg, jpeg, png, gif)',
      );
    }

    // Đường dẫn tĩnh mà client sẽ truy cập
    const fileUrl = `/public/uploads/${file.filename}`;

    return {
      message: 'Upload thành công',
      url: fileUrl,
    };
  }
}
