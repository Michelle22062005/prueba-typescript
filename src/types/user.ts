import { Role } from "@prisma/client";

// User is the shared client-side representation used by admin and navigation UIs.
export interface User {
    id: number;
    name: string;
    email: string;
    address?: string;
    phone?: string;
    nit?: string;
    password: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
}
