
import { HttpClient } from './api/httpClient';
import { withAuth, API_BASE_URL } from './api/config';

/**
 * Servicio para gestión de almacenamiento
 */
export class StorageService {
  /**
   * Sube una imagen
   */
  static async uploadImage(
    file: File,
    folderPath: string,
  ): Promise<string | null> {
    try {
      // Crear FormData para envío de archivos
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderPath', folderPath);
      // Opciones para petición con FormData
      const options: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
          // No establecer Content-Type para FormData
        }
      };
      
      // Añadir token de autenticación si existe
      const authOptions = withAuth(options);
      
      const response = await fetch(`${API_BASE_URL}/storage/upload`, authOptions);
      
      if (!response.ok) {
        throw new Error(`Error al subir la imagen: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  }

  /**
   * Sube una imagen
   */
  static async uploadImageDrover(
    file: File,
    folderPath: string,
  ): Promise<string | null> {
    try {
      // Crear FormData para envío de archivos
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderPath', folderPath);
      // Opciones para petición con FormData
      const options: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
          // No establecer Content-Type para FormData
        }
      };
      
      // Añadir token de autenticación si existe
      const authOptions = withAuth(options);
      
      // Intento primario: endpoint específico para drover
      let response = await fetch(`${API_BASE_URL}/storage/upload/drover`, authOptions);
      if (!response.ok) {
        // Fallback silencioso a endpoint genérico
        response = await fetch(`${API_BASE_URL}/storage/upload`, authOptions);
      }
      if (!response.ok) {
        throw new Error(`Error al subir la imagen: ${response.statusText}`);
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  }

  /**
   * Sube múltiples imágenes
   */
  static async uploadMultipleImages(
    files: Record<string, File>, 
    transferId: string, 
    category: string
  ): Promise<Record<string, string> | null> {
    try {
      const results: Record<string, string> = {};

      // Procesar cada archivo
      for (const [key, file] of Object.entries(files)) {
        const folderPath = `transfers/${transferId}/${category}`;
        const url = await StorageService.uploadImage(file, 'medusa-ecommerce-bucket', folderPath);
        
        if (url) {
          results[key] = url;
        } else {
          throw new Error(`Error al subir imagen: ${key}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Error al subir múltiples imágenes:', error);
      return null;
    }
  }
}

// Funciones para compatibilidad con el código existente
export const uploadImage = StorageService.uploadImage;
export const uploadMultipleImages = StorageService.uploadMultipleImages;
