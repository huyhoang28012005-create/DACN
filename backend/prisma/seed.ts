import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vju.ac.vn' },
    update: {},
    create: {
      email: 'admin@vju.ac.vn',
      password: 'hashed_password_here', // We will hash passwords in Phase 2
      fullName: 'System Admin',
      code: 'ADM001',
      role: 'ADMIN',
    },
  });

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'student@vju.ac.vn' },
    update: {},
    create: {
      email: 'student@vju.ac.vn',
      password: 'hashed_password_here',
      fullName: 'Nguyen Van A',
      code: 'STU12345',
      role: 'STUDENT',
    },
  });

  // Create a room
  const room = await prisma.room.create({
    data: {
      name: 'Lab 101',
      capacity: 30,
    },
  });

  // Create equipment
  const equipment = await prisma.equipment.create({
    data: {
      name: 'Microscope',
      code: 'EQ-001',
      qrCode: 'QR-EQ-001',
      roomId: room.id,
      status: 'AVAILABLE',
    },
  });

  console.log('Database seeded!');
  console.log({ admin, student, room, equipment });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
