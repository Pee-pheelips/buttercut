import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const OverlayEditor = ({ onAddText, onAddImage, onAddVideo }) => {
  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAddImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleAddVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAddVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Overlay</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={onAddText}>
          <Feather name="type" size={24} color={theme.colors.text} />
          <Text style={styles.buttonText}>Text</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
          <Feather name="image" size={24} color={theme.colors.text} />
          <Text style={styles.buttonText}>Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddVideo}>
          <Feather name="film" size={24} color={theme.colors.text} />
          <Text style={styles.buttonText}>Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minWidth: 80,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
});

export default OverlayEditor;
