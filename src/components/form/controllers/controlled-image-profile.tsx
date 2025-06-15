"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon } from "lucide-react";

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

export function ControlledImageProfile<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  isDirty = false,
  size = 150,
  fallback = "IMG",
  imageUrl = "",
  className = "",
  accept = "image/*",
}: ControlledImageProps<FormType>) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDirty) {
      setPreviewUrl(previewUrl);
    } else if (imageUrl) {
      setPreviewUrl("");
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

        const displayUrl = isDirty ? previewUrl : imageUrl;

        return (
          <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex justify-center items-center">
              <Label htmlFor={name} className="block text-sm font-medium">
                {label.replace("*", "")}
                {label.includes("*") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            </div>

            <div className="relative flex flex-col items-center gap-3">
              <Avatar
                style={{ height: size, width: size }}
                className="border border-border"
              >
                {displayUrl ? (
                  <AvatarImage
                    className="text-center"
                    src={previewUrl || displayUrl}
                    
                    alt="Imagem do perfil"
                  />
                ) : null}
                <AvatarFallback className="bg-muted">
                  {!isDirty && !previewUrl ? (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    fallback
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="top-0 right-0 absolute -bottom-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-12 h-12  rounded-full"
                  onClick={handleButtonClick}
                  disabled={uploading}
                >
                  <Camera className="h-12 w-12" />
                </Button>
                <input
                  type="file"
                  id={name}
                  name={name}
                  accept={accept}
                  onChange={handleUpload}
                  disabled={uploading}
                  ref={inputRef}
                  className="hidden w-0 h-0"
                />
              </div>
            </div>

            {error?.message && (
              <p className="mt-1 text-sm text-destructive text-center">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}