import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, PanResponder, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { VideoView } from 'expo-video';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from '../utils/constants';
import { theme } from '../styles/theme';

const VideoPlayer = ({ 
  player,
  overlays = [], 
  currentTime = 0,
  selectedOverlay,
  onOverlayMove,
  onOverlayUpdate,
  onPlayPause
}) => {
  // Filter overlays that should be visible at current time
  // Filter overlays that should be visible at current time and sort them
  // Images first (bottom), then Text (top) to ensure text is always visible
  const activeOverlays = overlays
    .filter(overlay => currentTime >= overlay.startTime && currentTime <= overlay.endTime)
    .sort((a, b) => {
      const getScore = (type) => {
        if (type === 'text') return 2;
        if (type === 'image') return 1;
        if (type === 'video') return 1;
        return 0;
      };
      return getScore(a.type) - getScore(b.type);
    });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.videoContainer} 
        onPress={onPlayPause}
      >
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          contentFit="contain"
        />
      </TouchableOpacity>
      
      {/* Overlay Container */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {activeOverlays.map(overlay => (
          <DraggableOverlay
            key={overlay.id}
            overlay={overlay}
            isSelected={selectedOverlay === overlay.id}
            onMove={onOverlayMove}
            onUpdate={onOverlayUpdate}
          />
        ))}
      </View>
    </View>
  );
};

const DraggableOverlay = ({ overlay, isSelected, onMove, onUpdate }) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [textValue, setTextValue] = useState(overlay.content || '');

  // Convert percentage to pixels for display
  const pixelX = (overlay.x / 100) * VIDEO_WIDTH;
  const pixelY = (overlay.y / 100) * VIDEO_HEIGHT;
  
  const pan = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  // Use a ref to keep track of the latest overlay props without recreating PanResponder
  const overlayRef = React.useRef(overlay);
  React.useLayoutEffect(() => {
    overlayRef.current = overlay;
  });
  
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isEditingText,
      onMoveShouldSetPanResponder: () => !isEditingText,
      onPanResponderGrant: () => {
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        const currentOverlay = overlayRef.current;
        const currentPixelX = (currentOverlay.x / 100) * VIDEO_WIDTH;
        const currentPixelY = (currentOverlay.y / 100) * VIDEO_HEIGHT;
        
        const newPixelX = currentPixelX + gesture.dx;
        const newPixelY = currentPixelY + gesture.dy;
        
        const newX = Math.max(0, Math.min(100, (newPixelX / VIDEO_WIDTH) * 100));
        const newY = Math.max(0, Math.min(100, (newPixelY / VIDEO_HEIGHT) * 100));
        
        pan.setValue({ x: 0, y: 0 });
        
        if (onMove) {
          onMove(currentOverlay.id, { x: newX, y: newY });
        }
      }
    })
  ).current;

  const handleDoubleTap = () => {
    if (overlay.type === 'text') {
      setIsEditingText(true);
      setTextValue(overlay.content);
    }
  };

  const handleTextSubmit = () => {
    if (onUpdate && textValue !== overlay.content) {
      onUpdate(overlay.id, { content: textValue });
    }
    setIsEditingText(false);
  };

  const renderOverlayContent = () => {
    switch (overlay.type) {
      case 'text':
        if (isEditingText) {
          return (
            <TextInput
              style={[
                styles.textOverlay,
                styles.textInput,
                {
                  fontSize: overlay.fontSize,
                  color: overlay.color,
                  width: overlay.width,
                  minHeight: overlay.height,
                }
              ]}
              value={textValue}
              onChangeText={setTextValue}
              onBlur={handleTextSubmit}
              onSubmitEditing={handleTextSubmit}
              autoFocus
              multiline
            />
          );
        }
        return (
          <Text
            style={[
              styles.textOverlay,
              {
                fontSize: overlay.fontSize,
                color: overlay.color,
              }
            ]}
          >
            {overlay.content}
          </Text>
        );
      
      case 'image':
        return (
          <>
            <Image
              source={{ uri: overlay.uri }}
              style={{
                width: overlay.width,
                height: overlay.height,
              }}
              resizeMode="contain"
            />
            {isSelected && <ResizeHandles overlay={overlay} onUpdate={onUpdate} />}
          </>
        );
      
      case 'video':
        return (
          <View style={{
            width: overlay.width,
            height: overlay.height,
            backgroundColor: 'rgba(210, 255, 77, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Feather name="film" size={24} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, marginTop: 4 }}>Video Overlay</Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  let lastTap = null;
  const handleTap = () => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
      handleDoubleTap();
    }
    lastTap = now;
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggableOverlay,
        {
          left: pixelX,
          top: pixelY,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ],
          width: overlay.width,
          height: overlay.height,
          borderWidth: isSelected ? 2 : 0,
          borderColor: theme.colors.primary,
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleTap}
        style={{ flex: 1 }}
      >
        {renderOverlayContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ResizeHandles = ({ overlay, onUpdate }) => {
  const handleSize = 20;
  
  const createResizeHandler = (corner) => {
    const initialSize = React.useRef({ width: overlay.width, height: overlay.height });
    
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialSize.current = { width: overlay.width, height: overlay.height };
      },
      onPanResponderMove: (_, gesture) => {
        let newWidth = initialSize.current.width;
        let newHeight = initialSize.current.height;
        
        // Calculate aspect ratio
        const aspectRatio = initialSize.current.width / initialSize.current.height;
        
        if (corner === 'bottomRight' || corner === 'topRight') {
          newWidth = Math.max(50, initialSize.current.width + gesture.dx);
          newHeight = newWidth / aspectRatio;
        }
        
        if (onUpdate) {
          onUpdate(overlay.id, { 
            width: Math.round(newWidth), 
            height: Math.round(newHeight) 
          });
        }
      },
    });
  };

  const bottomRightResponder = createResizeHandler('bottomRight');

  return (
    <>
      {/* Bottom Right Handle */}
      <Animated.View
        {...bottomRightResponder.panHandlers}
        style={[
          styles.resizeHandle,
          {
            right: -handleSize / 2,
            bottom: -handleSize / 2,
          }
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none',
  },
  draggableOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  textOverlay: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 4,
    padding: 4,
  },
  resizeHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default VideoPlayer;
