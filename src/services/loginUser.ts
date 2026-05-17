import { User } from "@/types/user";
import prisma from "@/lib/db";
import { compareHashed } from "@/lib/hash";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/**
 * LoginUser validates credentials and creates both session tokens.
 * The route layer handles HTTP cookies; this service only owns auth business logic.
 */
export async function LoginUser(user: Pick<User, 'email' | 'password'>) {

    // Look up the user by the unique email submitted from the login form.
    const validateUser = await prisma.user.findUnique({
        where: { email: user.email }
    });

    if (!validateUser) {
        throw new Error("User not found");
    }

    // Compare the plain password against the stored bcrypt hash.
    const validateHash = await compareHashed(user.password, validateUser.password);
    if (!validateHash) {
        throw new Error("Incorrect password");
    }

    // Tokens contain only the identity fields needed by protected routes.
    const payload = {
        id: validateUser.id,
        email: validateUser.email,
        role: validateUser.role
    };

    // Return both tokens plus a safe user object without the password hash.
    return {
        accessToken: await generateAccessToken(payload),
        refreshToken: await generateRefreshToken(payload),
        user: {
            id: validateUser.id,
            name: validateUser.name,
            email: validateUser.email,
            role: validateUser.role
        }
    };
}
