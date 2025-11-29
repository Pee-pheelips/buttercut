import { useState, useEffect } from 'react';
import { useVideoPlayer } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';

export const useVideo = () => {
  const [video, setVideo] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create video player instance
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Setup playback status listener
  useEffect(() => {
    if (player && videoUri) {
      const subscription = player.addListener('timeUpdate', (event) => {
        setCurrentTime(event.currentTime);
        if (player.duration > 0) {
          setDuration(player.duration);
        }
      });
      
      const statusSubscription = player.addListener('statusChange', (status) => {
        setIsPlaying(status.isPlaying);
        if (status.duration > 0) {
          setDuration(status.duration);
        }
      });

      // Poll for smoother updates during playback
      const interval = setInterval(() => {
        if (player.playing) {
          setCurrentTime(player.currentTime);
        }
      }, 100);

      return () => {
        subscription.remove();
        statusSubscription.remove();
        clearInterval(interval);
      };
    }
  }, [player, videoUri]);

  const uploadVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideo(asset);
        setVideoUri(asset.uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error picking video:', error);
      return false;
    }
  };

  const togglePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  const seekTo = (time) => {
    if (player) {
      player.currentTime = time;
      setCurrentTime(time); // Update local state immediately for responsive UI
    }
  };

  const resetVideo = () => {
    if (player) {
      player.pause();
    }
    setVideo(null);
    setVideoUri(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  return {
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
  };
};
