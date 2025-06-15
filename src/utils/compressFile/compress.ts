import sharp from "sharp";

async function compressFiles(files: File[]) {
  const compressPromises = files.map(async (file) => {
    try {
      return await compressImage(file);
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      return null;
    }
  });

  return (await Promise.all(compressPromises)).filter((file) => file !== null);
}

 const compressImage = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const compressedBuffer = await sharp(buffer)
    .resize({ width: 900 }) // Redimensiona mantendo a proporção
    .jpeg({ quality: 60 })
    .png({ quality: 60 })
    .webp({ quality: 60 })
    .toBuffer();

  return compressedBuffer
};


function formatUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}


function triggerImageInput(id: string) {
  document.getElementById(id)?.click();
}


function handleImageInput(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0] ?? null;
  if (file) {
    return URL.createObjectURL(file);
  }
  return null;
}

export { compressFiles, formatUrl, compressImage, triggerImageInput, handleImageInput };
