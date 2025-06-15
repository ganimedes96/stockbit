

interface FirebaseAuthError {
  code?: string;
}

export function handleFirebaseAuthError(error: FirebaseAuthError): string {
    const firebaseCode = error?.code;
  
    switch (firebaseCode) {
      case "auth/email-already-exists":
        return "Já existe um usuário com esse email cadastrado";
      case "auth/invalid-password":
        return "Senha inválida. Use uma senha com pelo menos 6 caracteres.";
      case "auth/invalid-email":
        return "E-mail inválido";
      case "auth/user-not-found":
        return "Usuário não encontrado";
      case "auth/uid-already-exists":
        return "Esse ID de usuário já está em uso";
      default:
        return "Erro inesperado ao criar usuário";
    }
  }
  