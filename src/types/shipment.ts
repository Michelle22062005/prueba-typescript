// ShipmentStatus mirrors the Prisma enum used by shipment workflows.
export type ShipmentStatus = 'PENDING' | 'PENDING_SUPERADMIN_REVIEW' | 'PENDING_FOR_PAY' | 'AVAILABLE_FOR_ASSIGNMENT' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';

// Shipment is the shared client-side shape returned by shipment API responses.
export type Shipment = {
    id: number;
    cargoType: string;
    weight: number;
    dimensions: string | null;
    origin: string;
    destination: string;
    timeline: string;
    status: ShipmentStatus;
    sender: { id: number; name: string; email: string };
    driver: { id: number; name: string; email: string } | null;
    proposedPrice: number | null;
    approvedPrice: number | null;
    paymentStatus: string;
    rejectionReason: string | null;
    createdAt: string;
};
