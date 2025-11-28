import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10); // <-- hash the admin password

    await prisma.user.upsert({
        where: { email: 'swastik07mishra@gmail.com' },
        update: {
            password, // <-- safe to always update password in dev seeding
            role: 'ADMIN',
            emailVerified: true,
        },
        create: {
            email: 'swastik07mishra@gmail.com',
            name: 'MedZora Admin',
            password, // <-- use hashed password
            role: 'ADMIN',
            emailVerified: true,
        },
    });
}

main().then(() => {
    console.log("✅ Admin user seeded");
    prisma.$disconnect();
});
