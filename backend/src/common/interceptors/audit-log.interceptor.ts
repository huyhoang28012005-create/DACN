import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Chỉ bắt các request làm thay đổi dữ liệu
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const url = request.url;
    const user = request.user;
    const body = request.body;
    const params = request.params;

    // Cố gắng trích xuất record_id từ URL params
    let recordId = 0;
    if (params && params.id) {
      recordId = parseInt(params.id, 10);
      if (isNaN(recordId)) recordId = 0;
    }

    // Tên route/controller đang được thao tác (Lấy path không chứa query params)
    const tableName = url.split('?')[0];

    return next.handle().pipe(
      tap((data) => {
        // Nếu response trả về một record có id (Thường là khi CREATE), ưu tiên lấy id đó
        if (data && data.id && recordId === 0) {
          recordId = data.id;
        }

        // Fire-and-forget ghi log bất đồng bộ
        this.prisma.auditLog
          .create({
            data: {
              action: `${method} ${url}`,
              table_name: tableName,
              record_id: recordId,
              user_id: user?.id || null, // Có thể null nếu api public (Login/Register)
              details: body && Object.keys(body).length > 0 ? JSON.stringify(body) : null,
            },
          })
          .catch((err) => {
            this.logger.error(`Lỗi khi ghi Audit Log: ${err.message}`);
          });
      }),
    );
  }
}
