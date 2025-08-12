/**
 * Local File Service - Handles file uploads to local server
 * Fallback when Firebase is having CORS issues
 */

class LocalFileService {
  private serverUrl = 'http://localhost:3001'; // Backend server URL

  private getAuthToken(): string | null {
    const session = localStorage.getItem('zooquest_session');
    if (session) {
      const sessionData = JSON.parse(session);
      return sessionData.token;
    }
    return null;
  }

  async uploadAnimalImage(animalId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.serverUrl}/api/uploads/animals/${animalId}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl || result.imageUrl
      };
    } catch (error) {
      console.error('Error uploading animal image:', error);
      throw error;
    }
  }

  async uploadEventImage(eventId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.serverUrl}/api/uploads/events/${eventId}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl || result.imageUrl
      };
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  }

  async uploadProfileImage(imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.serverUrl}/api/uploads/profile`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl || result.imageUrl
      };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
}

export const localFileService = new LocalFileService();
export default localFileService;
