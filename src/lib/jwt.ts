import { SignJWT, jwtVerify, type JWTPayload as JosePayload } from 'jose';

// JWTPayload carries the user identity and role through signed tokens.
interface JWTPayload extends JosePayload {
    id: number;
    email: string;
    role: 'ADMIN' | 'COMPANY' | 'DRIVER' | 'CUSTOMER';
}

// Secrets are encoded once so jose can sign and verify HS256 tokens.
const accessToken = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshToken = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

// Generates a short-lived token for page/API access.
export async function generateAccessToken(payload: JWTPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(accessToken);
}

// Generates a longer-lived token used to request new access tokens.
export async function generateRefreshToken(payload: JWTPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(refreshToken);
}

// Validates an access token and returns null instead of throwing on failure.
export async function validateAccessToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, accessToken);
        return payload as unknown as JWTPayload;
    } catch (error: unknown) {
        return null;
    }
}

// Validates a refresh token and returns null when it is missing, invalid, or expired.
export async function validateRefreshToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, refreshToken);
        return payload as unknown as JWTPayload;
    } catch (error: unknown) {
        return null;
    }
}
