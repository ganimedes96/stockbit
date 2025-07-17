import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ProductValidity({ date }: { date: Date }) {
  const today = new Date();
  const diffInDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let text = format(date, "dd/MM/yyyy", { locale: ptBR });
  let style = "text-green-600";

  if (diffInDays <= 0) {
    text += " (Vencido)";
    style = "text-red-600 font-bold";
  } else if (diffInDays <= 7) {
    text += " (Próximo)";
    style = "text-orange-600 font-medium";
  }

  return <span className={style}>{text}</span>;
}
