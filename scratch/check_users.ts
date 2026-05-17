import prisma from '../src/lib/db';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
