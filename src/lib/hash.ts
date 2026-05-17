import bcrypt from 'bcryptjs';

// Ten rounds is a common balance between password security and login latency.
const hashRound = 10;

// Hashes a plain password before saving it to the database.
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, hashRound);
}

// Compares a login password with the stored bcrypt hash.
export async function compareHashed(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
}
