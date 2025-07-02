import { Collections } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Neighborhood } from "./types";



export async function  getNeighborhoods(companyId: string) {
  const clientsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.neighborhoods
    );
    const q = query(clientsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
  
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        id: doc.id,
      } as Neighborhood;
    });
}


export async function getNeighborhoodById(companyId: string, neighborhoodId: string) {
  const clientsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.neighborhoods,
      neighborhoodId
    );
    const q = query(clientsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
  
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        id: doc.id,
      } as Neighborhood;
    });
} 