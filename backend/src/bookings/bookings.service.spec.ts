import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('BookingsService - Race Condition Prevention', () => {
  let service: BookingsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            booking: { count: jest.fn() },
            $executeRaw: jest.fn(),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string, defaultValue: string) => {
                if (key === 'BOOKING_START_HOUR') return Promise.resolve('7');
                if (key === 'BOOKING_END_HOUR') return Promise.resolve('22');
                if (key === 'MIN_BOOKING_MINUTES') return Promise.resolve('30');
                if (key === 'MAX_BOOKING_MINUTES')
                  return Promise.resolve('240');
                if (key === 'MAINTENANCE_MODE') return Promise.resolve('false');
                return Promise.resolve(defaultValue);
              }),
          },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create booking (Pessimistic Locking)', () => {
    it('should use SELECT FOR UPDATE to prevent double-booking', async () => {
      const createBookingDto = {
        start_time: new Date(Date.now() + 3600000).toISOString(), // +1 hour
        end_time: new Date(Date.now() + 7200000).toISOString(), // +2 hours
        room_id: 1,
        purpose: 'Test race condition',
      };

      const mockTx = {
        $executeRaw: jest.fn().mockResolvedValue([]),
        booking: {
          count: jest.fn().mockResolvedValue(0),
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 1, ...createBookingDto }),
        },
        auditLog: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
      };

      jest
        .spyOn(prismaService, '$transaction')

        .mockImplementation((cb: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return cb(mockTx);
        });

      try {
        await service.create(createBookingDto, 1);
      } catch {
        // Ignored, we just want to check if executeRaw was called before any validation throws
      }

      // Verify that pessimistic lock was acquired
      expect(mockTx.$executeRaw).toHaveBeenCalled();
      const calls = mockTx.$executeRaw.mock.calls as unknown[][];
      const sqlQueries = calls.map((call) => (call[0] as string[]).join(''));
      expect(
        sqlQueries.some(
          (q) =>
            q.includes('SELECT id FROM rooms WHERE id =') &&
            q.includes('FOR UPDATE'),
        ),
      ).toBeTruthy();
    });
  });
});
