import { API_CONFIG } from '../utils/constants';

class ApiService {
  async uploadVideo(video, overlays, options) {
    const formData = new FormData();
    
    // Add video file
    formData.append('video', {
      uri: video.uri,
      type: 'video/mp4',
      name: 'video.mp4',
    });
    
    // Prepare metadata and files
    const metadataOverlays = [];
    let overlayFileIndex = 0;

    overlays.forEach(overlay => {
      const { uri, startTime, endTime, ...rest } = overlay;
      const overlayCopy = { 
        ...rest,
        start_time: startTime,
        end_time: endTime,
      };

      // For image/video overlays, we need to link the metadata to the uploaded file
      // The backend expects 'content' to match the file key (e.g., 'overlay_0')
      if ((overlay.type === 'image' || overlay.type === 'video') && uri) {
        const fileKey = `overlay_${overlayFileIndex}`;
        overlayCopy.content = fileKey;
        
        formData.append(fileKey, {
          uri: uri,
          type: overlay.type === 'image' ? 'image/jpeg' : 'video/mp4',
          name: `${fileKey}.${overlay.type === 'image' ? 'jpg' : 'mp4'}`,
        });
        overlayFileIndex++;
      }
      
      metadataOverlays.push(overlayCopy);
    });
    
    // Add metadata as JSON string
    formData.append('metadata', JSON.stringify(metadataOverlays));

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error details:', error);
      throw new Error(error.message || 'Network request failed');
    }
  }

  async getStatus(jobId) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return await response.json();
  }

  getDownloadUrl(jobId) {
    return `${API_CONFIG.BASE_URL}/download/${jobId}`;
  }
}

export default new ApiService();
