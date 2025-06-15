"use server";
import { getUser } from "@/domain/user/server";
import { db, storage } from "@/lib/firebase/admin";
import { randomUUID } from "crypto";
import { Timestamp } from "firebase/firestore";
import { Collections } from "@/lib/firebase/collections";
import { getDownlaodURLFromPath } from "@/utils/store-config/config";
import { compressImage } from "@/utils/compressFile/compress";
import { ProfileProps } from "./types";


export async function updateProfile(data: ProfileProps) {
  const user = await getUser();

  if (!user) return;

  try {
    const userId = user.id;
    const { firstName, lastName, phone, company } = data;
    const file = data.photo as File;

    const hasFile = file instanceof File && file.size > 0;
    let imagePath = null;

    const userDoc = await db
      .collection(Collections.companies)
      .doc(userId)
      .get();
    const currentImagePath = userDoc.data()?.imagePath;

    if (hasFile && currentImagePath) {
      const currentStorageRef = storage.file(currentImagePath);
      const [exists] = await currentStorageRef.exists();
      if (exists) {
        await currentStorageRef.delete();
      }
    }

    // 🔹 Faz upload da nova imagem caso tenha sido enviada
    if (hasFile) {
      const compressedBuffer = await compressImage(file);

      const storageRef = storage.file(`stokebit/${userId}/${randomUUID()}`);

      await storageRef.save(compressedBuffer);

      const path = storageRef.name;

      imagePath = await getDownlaodURLFromPath(path);
    }

    await db
      .collection(Collections.companies)
      .doc(userId)
      .update({
        firstName:firstName,
        lastName:lastName,
        phone: phone,
        ...(hasFile && { imagePath }),
        updatedAt: Timestamp.now().toMillis(),
        "company.name": company.name,
        "company.address": company.address,
        "company.cnpj": company.cnpj,
      });

    return true;
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return false;
  }
}