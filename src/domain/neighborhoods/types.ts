export interface Neighborhood {
    id: string;
    name: string;
    isActive: boolean;
    deliveryFee: number;
    minOrderValueForFreeShipping?: number;
    createdAt: Date;
    updatedAt?: Date;
    
}

export type NeighborhoodInput = Omit<Neighborhood, "id" | "createdAt" | "updatedAt">;

export type NeighborhoodUpdate = Omit<Neighborhood, "createdAt">;

