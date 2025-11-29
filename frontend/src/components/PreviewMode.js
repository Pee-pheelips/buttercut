import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import TimelineControls from './TimelineControls';
import VideoPlayer from './VideoPlayer';
const PreviewMode = ({ 
  visible, 
  onClose, 
  player, 
  overlays, 
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        
        {/* Close Button */}
        <TouchableOpacity style={[styles.closeButton, { flexDirection: 'row', alignItems: 'center', gap: 8 }]} onPress={onClose}>
          <Feather name="x" size={20} color={theme.colors.text} />
          <Text style={styles.closeText}>Exit Preview</Text>
        </TouchableOpacity>

        {/* Fullscreen Video Player */}
        <View style={styles.playerContainer}>
          <VideoPlayer
            player={player}
            overlays={overlays}
            currentTime={currentTime}
            selectedOverlay={null}
            onOverlayMove={() => {}}
            onOverlayUpdate={() => {}}
          />
        </View>

        {/* Timeline Controls */}
        <View style={styles.timelineContainer}>
          <TimelineControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
          />
          
          {/* Visual Timeline Bars */}
          <ScrollView style={styles.timelineScroll}>
            {overlays.map((overlay, index) => {
              const left = (overlay.startTime / (duration || 1)) * 100;
              const width = ((overlay.endTime - overlay.startTime) / (duration || 1)) * 100;
              
              return (
                <View key={overlay.id} style={styles.timelineRow}>
                  <View style={styles.timelineLabelContainer}>
                    <Text style={styles.timelineLabel} numberOfLines={1}>
                      {overlay.type === 'text' ? overlay.content : `${overlay.type} ${index + 1}`}
                    </Text>
                  </View>
                  <View style={styles.timelineTrack}>
                    <View 
                      style={[
                        styles.timelineBar, 
                        { 
                          left: `${left}%`, 
                          width: `${width}%`,
                          backgroundColor: overlay.type === 'text' ? theme.colors.primary : '#4D9FFF'
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    zIndex: 10,
  },
  closeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timelineContainer: {
    height: 200,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  timelineScroll: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 24,
  },
  timelineLabelContainer: {
    width: 80,
    marginRight: 10,
  },
  timelineLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  timelineTrack: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    justifyContent: 'center',
    position: 'relative',
  },
  timelineBar: {
    position: 'absolute',
    height: 16,
    borderRadius: 2,
    opacity: 0.8,
  },
  playheadContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 80 + 10, // Label width + margin
    right: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.error,
  },
  timeDisplay: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontVariant: ['tabular-nums'],
  },
});

export default PreviewMode;
