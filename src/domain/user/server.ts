import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { User } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    const userRef = db.collection(Collections.companies).doc(session.user.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return null;

    const user = userDoc.data();

    if (!user) return null;
    return {
      ...user,
      createdAt: user.createdAt.toDate(),
    } as User;
  }

  if (session.user.role === "employee") {
    const employeeRef = db
      .collection(Collections.companies)
      .doc(session.user.company.id)
      .collection(Collections.employees)
      .doc(session.user.id);
    const employeeDoc = await employeeRef.get();
    if (!employeeDoc.exists) return null;
    const employee = employeeDoc.data();
    if (!employee) return null;
    return {
      ...employee,
      createdAt: employee.createdAt.toDate(),
    } as User;
  }
}