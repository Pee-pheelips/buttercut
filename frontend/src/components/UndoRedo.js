import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const UndoRedo = ({ onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canUndo && styles.buttonDisabled]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="rotate-ccw" size={16} color={!canUndo ? theme.colors.textSecondary : theme.colors.text} />
          <Text style={[styles.buttonText, !canUndo && styles.buttonTextDisabled]}>
            Undo
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !canRedo && styles.buttonDisabled]}
        onPress={onRedo}
        disabled={!canRedo}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="rotate-cw" size={16} color={!canRedo ? theme.colors.textSecondary : theme.colors.text} />
          <Text style={[styles.buttonText, !canRedo && styles.buttonTextDisabled]}>
            Redo
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  button: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: theme.colors.textSecondary,
  },
});

export default UndoRedo;
