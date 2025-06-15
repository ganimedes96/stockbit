import { Auth } from "@/domain/auth/types";
import { Collections } from "@/lib/firebase/collections";
import { auth, db } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  collectionGroup,
  query,
  where,
} from "firebase/firestore";

export async function verifyExistUser(id: string) {
  if (!id) return null;
  try {
    const companyDocRef = doc(db, Collections.companies, id);
    const companyDoc = await getDoc(companyDocRef);
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Auth;
    }
    const employeesQuery = query(
      collectionGroup(db, Collections.employees),
      where("id", "==", id),
      where("active", "==", true)
    );
    const employeeSnapshot = await getDocs(employeesQuery);
    if (!employeeSnapshot.empty) {
      console.log("Employee found");
      const employeeDoc = employeeSnapshot.docs[0];
      const employeeData = employeeDoc.data();
      return {
        ...employeeData,
        createdAt: employeeData.createdAt.toDate(),
      } as Auth;
    }

    throw new Error("User not found");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function reauthenticateUser(id: string) {
  if (!id) return null;
  try {
    const companyDocRef = doc(db, Collections.companies, id);
    const companyDoc = await getDoc(companyDocRef);
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      const { user } = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      return user;
    }
    const employeesQuery = query(
      collectionGroup(db, Collections.employees),
      where("id", "==", id),
      where("active", "==", true)
    );
    const employeeSnapshot = await getDocs(employeesQuery);
    if (!employeeSnapshot.empty) {
      const employeeDoc = employeeSnapshot.docs[0];
      const data = employeeDoc.data();
      const { user } = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      return user;
    }
    throw new Error("User not found");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const companyQuery = query(
      collectionGroup(db, Collections.companies),
      where("email", "==", email)
    );
    const companySnapshot = await getDocs(companyQuery);
    if (!companySnapshot.empty) {
      const companyDoc = companySnapshot.docs[0];
      const data = companyDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Auth;
    }
    const employeesQuery = query(
      collectionGroup(db, Collections.employees),
      where("email", "==", email),
      where("active", "==", true)
    );
    const employeeSnapshot = await getDocs(employeesQuery);
    if (!employeeSnapshot.empty) {
      const employeeDoc = employeeSnapshot.docs[0];
      const data = employeeDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Auth;
    }
    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
