"use server"
import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { Movements } from "./types";

export async function getMovementsServer(companyId: string) {

        const productsRef = db
            .collection(Collections.companies)
            .doc(companyId)
            .collection(Collections.movements)
            .orderBy("createdAt", "desc");
    
        const productsSnapshot = await productsRef.get();
    
        const movements: Movements[] = productsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Movements;
        });
    
        return movements;
    
}
