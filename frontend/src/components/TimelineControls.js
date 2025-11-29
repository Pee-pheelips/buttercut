import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const TimelineControls = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState(0);

  React.useEffect(() => {
    if (!isDragging) {
      setSliderValue(currentTime);
    }
  }, [currentTime, isDragging]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
          <Feather 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color={theme.colors.background} 
          />
        </TouchableOpacity>

        <View style={styles.timelineContainer}>
          <Text style={styles.timeText}>{formatTime(isDragging ? sliderValue : currentTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={sliderValue}
            onSlidingStart={() => setIsDragging(true)}
            onValueChange={(val) => {
              setSliderValue(val);
              onSeek(val);
            }}
            onSlidingComplete={() => setIsDragging(false)}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timelineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    minWidth: 40,
  },
});

export default TimelineControls;
