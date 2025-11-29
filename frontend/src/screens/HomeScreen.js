import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';

import VideoPlayer from '../components/VideoPlayer';
import TimelineControls from '../components/TimelineControls';
import OverlayEditor from '../components/OverlayEditor';
import OverlayList from '../components/OverlayList';
import UploadButton from '../components/UploadButton';
import UndoRedo from '../components/UndoRedo';
import PreviewMode from '../components/PreviewMode';

import { useVideo } from '../hooks/useVideo';
import { useOverlays } from '../hooks/useOverlays';
import ApiService from '../services/api';
import { theme } from '../styles/theme';
import { API_CONFIG, PROCESSING_STATUS } from '../utils/constants';

const HomeScreen = () => {
  const [processingStatus, setProcessingStatus] = useState(PROCESSING_STATUS.IDLE);
  const [jobId, setJobId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    video,
    videoUri,
    currentTime,
    duration,
    isPlaying,
    player,
    uploadVideo,
    togglePlayPause,
    seekTo,
    resetVideo,
  } = useVideo();

  const {
    overlays,
    selectedOverlay,
    setSelectedOverlay,
    addTextOverlay,
    addImageOverlay,
    addVideoOverlay,
    updateOverlay,
    deleteOverlay,
    resetOverlays,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useOverlays(currentTime, duration);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Poll for job status
  useEffect(() => {
    if (
      jobId &&
      processingStatus !== PROCESSING_STATUS.COMPLETED &&
      processingStatus !== PROCESSING_STATUS.FAILED
    ) {
      const interval = setInterval(async () => {
        try {
          const data = await ApiService.getStatus(jobId);
          setProcessingStatus(data.status);

          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, API_CONFIG.POLLING_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [jobId, processingStatus]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant media library permissions to use this app'
        );
      }
    }
  };

  const handleVideoUpload = async () => {
    const success = await uploadVideo();
    if (success) {
      resetOverlays();
      setJobId(null);
      setProcessingStatus(PROCESSING_STATUS.IDLE);
    }
  };

  const handleSubmit = async () => {
    if (!video) {
      Alert.alert('Error', 'Please upload a video first');
      return;
    }

    if (overlays.length === 0) {
      Alert.alert(
        'No Overlays',
        'You haven\'t added any overlays. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => processVideo() },
        ]
      );
      return;
    }

    processVideo();
  };

  const processVideo = async () => {
    try {
      setProcessingStatus(PROCESSING_STATUS.UPLOADING);

      const response = await ApiService.uploadVideo(video, overlays, {});

      setJobId(response.job_id);
      setProcessingStatus(PROCESSING_STATUS.PROCESSING);
      Alert.alert('Success', 'Video uploaded successfully. Processing...');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Make sure the backend server is running.\n\nError: ' + error.message
      );
      setProcessingStatus(PROCESSING_STATUS.FAILED);
    }
  };

  const handleDownload = () => {
    if (jobId && processingStatus === PROCESSING_STATUS.COMPLETED) {
      const url = ApiService.getDownloadUrl(jobId);
      Alert.alert(
        'Download Ready',
        `Your video is ready!\n\nDownload URL:\n${url}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusColor = () => {
    switch (processingStatus) {
      case PROCESSING_STATUS.COMPLETED:
        return theme.colors.success;
      case PROCESSING_STATUS.FAILED:
        return theme.colors.danger;
      case PROCESSING_STATUS.PROCESSING:
      case PROCESSING_STATUS.UPLOADING:
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Video Editor</Text>

        {/* Upload Button */}
        {!videoUri && <UploadButton onPress={handleVideoUpload} />}

        {/* Video Player */}
        {videoUri && (
          <>
            <VideoPlayer
              player={player}
              overlays={overlays}
              currentTime={currentTime}
              selectedOverlay={selectedOverlay}
              onOverlayMove={updateOverlay}
              onOverlayUpdate={updateOverlay}
              onPlayPause={togglePlayPause}
            />

            <TimelineControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={togglePlayPause}
              onSeek={seekTo}
            />

            <UndoRedo
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />

            <TouchableOpacity 
              style={[styles.previewButton, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}
              onPress={() => setShowPreview(true)}
            >
              <Feather name="eye" size={20} color={theme.colors.background} />
              <Text style={styles.previewButtonText}>Preview Mode</Text>
            </TouchableOpacity>

            <OverlayEditor
              onAddText={addTextOverlay}
              onAddImage={addImageOverlay}
              onAddVideo={addVideoOverlay}
            />

            <OverlayList
              overlays={overlays}
              selectedOverlay={selectedOverlay}
              onSelectOverlay={setSelectedOverlay}
              onUpdateOverlay={updateOverlay}
              onDeleteOverlay={deleteOverlay}
            />

            {/* Submit Section */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (processingStatus === PROCESSING_STATUS.UPLOADING ||
                    processingStatus === PROCESSING_STATUS.PROCESSING) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  processingStatus === PROCESSING_STATUS.UPLOADING ||
                  processingStatus === PROCESSING_STATUS.PROCESSING
                }
              >
                {processingStatus === PROCESSING_STATUS.UPLOADING ||
                processingStatus === PROCESSING_STATUS.PROCESSING ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {processingStatus === PROCESSING_STATUS.UPLOADING
                      ? 'Uploading...'
                      : processingStatus === PROCESSING_STATUS.PROCESSING
                      ? 'Processing...'
                      : 'Render Video'}
                  </Text>
                )}
              </TouchableOpacity>

              {processingStatus !== PROCESSING_STATUS.IDLE && (
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor() },
                    ]}
                  >
                    {processingStatus}
                  </Text>
                </View>
              )}

              {processingStatus === PROCESSING_STATUS.COMPLETED && (
                <TouchableOpacity
                  style={[styles.downloadButton, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]}
                  onPress={handleDownload}
                >
                  <Feather name="download" size={20} color={theme.colors.text} />
                  <Text style={styles.downloadButtonText}>Download Video</Text>
                </TouchableOpacity>
              )}

              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.resetButton, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]}
                onPress={() => {
                  resetVideo();
                  resetOverlays();
                  setJobId(null);
                  setProcessingStatus(PROCESSING_STATUS.IDLE);
                }}
              >
                <Feather name="refresh-cw" size={16} color={theme.colors.text} />
                <Text style={styles.resetButtonText}>Start New Project</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Preview Mode Modal */}
      <PreviewMode
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        player={player}
        overlays={overlays}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onSeek={seekTo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  submitSection: {
    marginVertical: theme.spacing.xl,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  submitButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  statusLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  statusText: {
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  downloadButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
  previewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  previewButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});

export default HomeScreen;