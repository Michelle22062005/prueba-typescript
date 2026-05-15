import { User } from "@/types/user";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/hash";

/**
 * registerUser creates a basic user account after checking email uniqueness.
 * This service is currently separate from the richer register API route.
 */
export async function registerUser(user: User): Promise<void> {

    // The email column is unique, so this prevents a duplicate-account attempt.
    const validateRegister = await prisma.user.findUnique({
        where: { email: user.email }
    });

    if (validateRegister) {
        throw new Error("User already exists");
    }

    // Store only the hashed password, never the plain submitted password.
    const hashed = await hashPassword(user.password);

    // Create the minimal user fields required by the schema defaults.
    await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            password: hashed
        }
    });
}
