// components/ProductRow.tsx (exemplo de caminho)
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

// Tipos para as props
// (Assuma que você tem um tipo para seus produtos, se não, pode usar 'any' temporariamente)
type Product = {
  id: string;
  name: string;
  salePrice: number;
};

interface ProductRowProps {
  index: number;
  allProducts: Product[] | undefined;
  loadingProducts: boolean;
  onRemove: (index: number) => void;
  isOnlyOne: boolean; // Para saber se deve mostrar o botão de remover
}

export function ProductRow({
  index,
  allProducts,
  loadingProducts,
  onRemove,
  isOnlyOne,
}: ProductRowProps) {
  // Obtém acesso ao form global sem precisar passar tudo via props
  const { control, setValue, watch } = useFormContext();

  // Observa os valores desta linha específica
  const priceUnit = watch(`products.${index}.priceUnit`);
  const quantity = watch(`products.${index}.quantity`);
  const subtotal = (Number(priceUnit) || 0) * (Number(quantity) || 0);

  // Observa o ID do produto selecionado para auto-preencher o preço
  const selectedProductId = watch(`products.${index}.productId`);

  // ESTE useEffect AGORA VIVE DENTRO DO SEU PRÓPRIO COMPONENTE.
  // ISSO É SEGURO E CORRETO.
  useEffect(() => {
    if (selectedProductId && allProducts) {
      const productDetails = allProducts.find((p) => p.id === selectedProductId);
      if (productDetails && typeof productDetails.salePrice === "number") {
        setValue(`products.${index}.priceUnit`, productDetails.salePrice, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [selectedProductId, allProducts, setValue, index]);

  return (
    <Card className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] items-end gap-4 p-4">
      <ControlledCombobox
        control={control}
        name={`products.${index}.productId`}
        label="Produto"
        loading={loadingProducts}
        options={allProducts?.map((product) => ({
          id: product.id,
          name: product.name,
        }))}
        placeholder="Selecione um produto"
      />
      <ControlledInput
        placeholder=""
        control={control}
        name={`products.${index}.priceUnit`}
        label="Preço unitário"
        type="number"
        step="0.01"
        min="0"
      />
      <ControlledInput
        placeholder=""
        control={control}
        name={`products.${index}.quantity`}
        label="Quantidade"
        type="number"
        min="1"
      />
      <div className="flex flex-col justify-center h-full pb-2">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="font-semibold">
          {subtotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>

      {!isOnlyOne && (
        <Button
          type="button"
          onClick={() => onRemove(index)}
          variant="destructive"
          size="icon"
          className="flex items-center justify-center mb-4"
        >
          <Trash size={16} />
        </Button>
      )}
    </Card>
  );
}