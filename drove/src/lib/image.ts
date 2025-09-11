// Simple client-side image optimization helper used before uploads
// Scales down to maxWidth and encodes as JPEG with the provided quality

export async function optimizeImageForUpload(
  file: File,
  maxWidth: number = 1600,
  quality: number = 0.75
): Promise<File> {
  try {
    // Only process images; otherwise return as is
    if (!file.type.startsWith('image/')) return file;

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    const scale = Math.min(1, maxWidth / (image.width || maxWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((image.width || maxWidth) * scale));
    canvas.height = Math.max(1, Math.round((image.height || maxWidth) * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    );

    URL.revokeObjectURL(image.src);
    if (!blob) return file;

    const optimized = new File(
      [blob],
      file.name.replace(/\.(png|jpg|jpeg|heic|webp)$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
    return optimized;
  } catch {
    return file;
  }
}

export default optimizeImageForUpload;


