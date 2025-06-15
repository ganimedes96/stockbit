
export function getUserInitials(fullName: string): string {
  
  const names = fullName.trim().split(" ");

  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }

  return names[0].substring(0, 2).toUpperCase();
}