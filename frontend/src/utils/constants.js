import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const VIDEO_WIDTH = SCREEN_WIDTH - 32;
export const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

// API Configuration
export const API_CONFIG = {
  // Change based on your setup:
  // iOS Simulator: 'http://localhost:8000'
  // Android Emulator: 'http://10.0.2.2:8000'
  // Physical Device: 'http://YOUR_IP:8000'
  BASE_URL: 'http://localhost:8000',
  POLLING_INTERVAL: 2000, // 2 seconds
};

// Overlay Defaults
export const OVERLAY_DEFAULTS = {
  text: {
    content: 'Sample Text',
    fontSize: 24,
    color: '#ffffff',
    width: 200,
    height: 50,
  },
  image: {
    width: 150,
    height: 100,
  },
  video: {
    width: 150,
    height: 100,
  },
};

// Processing Status
export const PROCESSING_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};