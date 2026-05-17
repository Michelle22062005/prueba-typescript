import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@trux.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('Admin user created successfully:', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
