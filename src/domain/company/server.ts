import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { User } from "../user/types";

export async function getCompanyOwnerBySlug(slug: string): Promise<User | null> {
  try {
    // 1. A referência agora aponta para a coleção 'users'.
    const usersRef = db.collection(Collections.companies);

    // 2. A query agora tem DUAS condições:
    //    - Encontrar onde o campo aninhado 'company.slug' é igual ao slug fornecido.
    //    - E onde a 'role' do usuário é 'admin'.
    const q = usersRef
      .where("company.slug", "==", slug)
      .where("role", "==", "admin")
      .limit(1); // Usamos limit(1) por segurança, pois só deve haver um dono.

    // 3. Executa a query
    const querySnapshot = await q.get();

    // 4. Verifica se encontrou algum resultado
    if (querySnapshot.empty) {
      console.warn(`Nenhum usuário 'admin' encontrado para a empresa com slug: ${slug}`);
      return null;
    }

    // 5. Pega o primeiro (e único) documento e seus dados
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // 6. Converte os Timestamps do Firestore para objetos Date do JavaScript (MUITO IMPORTANTE)
    // Isso evita os erros de 'toDate' no seu código do frontend.
    const processedUser = {
      ...userData,
      id: userDoc.id,
      createdAt: userData.createdAt.toDate(),
      
    };

    // 7. Retorna o objeto completo do usuário, que já contém os dados da empresa.
    return processedUser as User;
    
  } catch (error) {
    console.error("Erro ao buscar usuário pelo slug da empresa:", error);
    return null;
  }
}