"use server"
import { auth } from "@/lib/firebase/firebase";
import { verifyExistUser } from "@/lib/firebase/requests";
import { signInWithEmailAndPassword } from "firebase/auth";


interface Credentials {
  email: string;
  password: string;
}

export async function login(credentials: Credentials) {
  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    const client = await verifyExistUser(user.uid);
    return client;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
