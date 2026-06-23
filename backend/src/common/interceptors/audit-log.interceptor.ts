import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id?: number; userId?: number } }>();
    const method = request.method;

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const url = request.url;
    const user = request.user;
    const body = request.body as Record<string, unknown>;
    const params = request.params;

    let recordId = 0;
    if (params && params.id) {
      recordId = parseInt(params.id as string, 10);
      if (isNaN(recordId)) recordId = 0;
    }

    const tableName = url.split('?')[0];

    return next.handle().pipe(
      tap((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'id' in (data as Record<string, unknown>) &&
          recordId === 0
        ) {
          recordId = Number((data as Record<string, unknown>).id);
        }

        const userId = user?.id || user?.userId || null;
        const details =
          body && Object.keys(body).length > 0 ? JSON.stringify(body) : null;
        const action = `${method} ${url}`;

        // Cryptographic Audit Trail (Hash Chaining)
        this.prisma
          .$transaction(async (tx) => {
            const lastLog = await tx.auditLog.findFirst({
              orderBy: { id: 'desc' },
            });

            const previousHash = lastLog?.current_hash || 'GENESIS_HASH';
            const timestamp = new Date();

            // Dữ liệu cần băm (Payload)
            const payload = `${previousHash}|${action}|${tableName}|${recordId}|${userId || 'SYSTEM'}|${details || 'NONE'}|${timestamp.toISOString()}`;
            const currentHash = createHash('sha256')
              .update(payload)
              .digest('hex');

            await tx.auditLog.create({
              data: {
                action,
                table_name: tableName,
                record_id: recordId,
                user_id: userId,
                details,
                previous_hash: previousHash,
                current_hash: currentHash,
                timestamp,
              },
            });
          })
          .catch((err: unknown) => {
            const error = err as Error;
            this.logger.error(`Lỗi khi ghi Audit Log: ${error.message}`);
          });
      }),
    );
  }
}
