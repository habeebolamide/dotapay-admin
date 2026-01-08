import { API_ENDPOINTS, LARAVEL_CONFIG } from '@/lib/laravel-config';
import { TokenStorage } from '@/lib/token-storage';

class UploadService {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = TokenStorage.getToken();
    const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.UPLOAD.IMAGE}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Failed to upload image (HTTP ${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();
    // Support either data.image_url or image_url at root
    return data?.data?.image_url || data?.image_url;
  }
}

export const uploadService = new UploadService();
