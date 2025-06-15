"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Trash2 } from "lucide-react"; // Adicionei o ícone de lixeira
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ControlledImageProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  size?: number;
  fallback?: string;
  imageUrl?: string;
  isDirty?: boolean;
  className?: string;
  accept?: string;
}

export function ControlledImage<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  isDirty = false,
  imageUrl = "",
  className = "",
  accept = "image/*",
}: ControlledImageProps<FormType>) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDirty && previewUrl) {
      setPreviewUrl(previewUrl);
    } else if (imageUrl) {
      setPreviewUrl(imageUrl);
    }
  }, [isDirty, imageUrl, previewUrl]);

  const handleFileChange = useCallback(
    (file: File | null, onChange: (file: File | null) => void) => {
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onChange(file);
      } else {
        setPreviewUrl("");
        onChange(null);
      }
    },
    []
  );

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleClearImage = (e: React.MouseEvent, onChange: (file: File | null) => void) => {
    e.stopPropagation();
    setPreviewUrl("");
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange }, fieldState: { error } }) => {
        const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
          try {
            setUploading(true);
            const file = event.target.files?.[0] || null;
            handleFileChange(file, onChange);
          } catch (error) {
            console.error("Erro ao fazer upload:", error);
          } finally {
            setUploading(false);
            event.target.value = "";
          }
        };

        return (
          <div className={cn("flex flex-col gap-3", className)}>
            <Label htmlFor={name} className="text-sm font-medium text-center">
              {label.replace("*", "")}
              {label.includes("*") && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>

            <div
              className="relative border-2 border-dashed border-muted rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition"
              onClick={handleButtonClick}
            >
              {previewUrl ? (
                <>
                  <Image
                    width={100}
                    height={100}
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover rounded-md max-h-60 w-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full w-8 h-8"
                    onClick={(e) => handleClearImage(e, onChange)}
                    title="Remover imagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ImageIcon className="w-12 h-12" />
                  <span className="text-sm">Clique ou arraste uma imagem JPG,JPEG ou PNG</span>
                </div>
              )}

              <input
                type="file"
                id={name}
                name={name}
                accept={accept}
                onChange={handleUpload}
                disabled={uploading}
                ref={inputRef}
                className="hidden"
              />
            </div>

            {error?.message && (
              <p className="text-sm text-destructive text-center">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}