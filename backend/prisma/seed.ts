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
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Create Hoàng Admin user
  const hoangAdmin = await prisma.user.upsert({
    where: { email: 'hoang@vju.ac.vn' },
    update: {},
    create: {
      email: 'hoang@vju.ac.vn',
      password: 'hoang281@',
      name: 'Hoàng',
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
      name: 'Nguyen Van A',
      role: 'STUDENT',
    },
  });

  // Create instructor user
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@vju.ac.vn' },
    update: {},
    create: {
      email: 'instructor@vju.ac.vn',
      password: 'hashed_password_here',
      name: 'Le Thi B',
      role: 'INSTRUCTOR',
    },
  });

  // Create a room
  const room = await prisma.room.upsert({
    where: { name: 'Lab 101' },
    update: {},
    create: {
      name: 'Lab 101',
      location: 'Tòa nhà A - Tầng 1',
      capacity: 30,
      has_air_conditioner: true,
    },
  });

  // Create equipment
  const equipment = await prisma.equipment.upsert({
    where: { serial_number: 'EQ-SN-001' },
    update: {},
    create: {
      name: 'Microscope',
      serial_number: 'EQ-SN-001',
      room_id: room.id,
      status: 'AVAILABLE',
    },
  });

  console.log('Database seeded!');
  console.log({ admin, student, instructor, room, equipment });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
