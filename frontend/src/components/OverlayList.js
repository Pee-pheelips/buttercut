import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import Slider from '@react-native-community/slider';

const OverlayList = ({
  overlays,
  selectedOverlay,
  onSelectOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
}) => {
  if (overlays.length === 0) return null;

  const selectedData = overlays.find((o) => o.id === selectedOverlay);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overlays ({overlays.length})</Text>
      <ScrollView style={styles.list}>
        {overlays.map((overlay) => (
          <TouchableOpacity
            key={overlay.id}
            style={[
              styles.overlayItem,
              selectedOverlay === overlay.id && styles.overlayItemSelected,
            ]}
            onPress={() => onSelectOverlay(overlay.id)}
          >
            <View style={styles.overlayHeader}>
              <Text style={[
                styles.overlayType,
                selectedOverlay === overlay.id && { color: theme.colors.background }
              ]}>{overlay.type.toUpperCase()}</Text>
              <TouchableOpacity
                onPress={() => onDeleteOverlay(overlay.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather 
                  name="trash-2" 
                  size={20} 
                  color={selectedOverlay === overlay.id ? theme.colors.background : theme.colors.error} 
                />
              </TouchableOpacity>
            </View>

            {selectedOverlay === overlay.id && (
              <View style={styles.editor}>
                {overlay.type === 'text' && (
                  <>
                    <TextInput
                      style={styles.input}
                      value={overlay.content}
                      onChangeText={(text) =>
                        onUpdateOverlay(overlay.id, { content: text })
                      }
                      placeholder="Text content"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      value={String(overlay.fontSize)}
                      onChangeText={(text) =>
                        onUpdateOverlay(overlay.id, {
                          fontSize: parseInt(text) || 24,
                        })
                      }
                      placeholder="Font size"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </>
                )}

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Start (s)</Text>
                    <TextInput
                      style={styles.input}
                      value={overlay.startTime.toFixed(1)}
                      onChangeText={(text) =>
                        onUpdateOverlay(overlay.id, {
                          startTime: parseFloat(text) || 0,
                        })
                      }
                      keyboardType="decimal-pad"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>End (s)</Text>
                    <TextInput
                      style={styles.input}
                      value={overlay.endTime.toFixed(1)}
                      onChangeText={(text) =>
                        onUpdateOverlay(overlay.id, {
                          endTime: parseFloat(text) || 0,
                        })
                      }
                      keyboardType="decimal-pad"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>X Position (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={overlay.x.toFixed(0)}
                      onChangeText={(text) =>
                        onUpdateOverlay(overlay.id, {
                          x: parseFloat(text) || 50,
                        })
                      }
                      keyboardType="numeric"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Y Position (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={overlay.y.toFixed(0)}
                      onChangeText={(text) =>
                        onUpdateOverlay(overlay.id, {
                          y: parseFloat(text) || 50,
                        })
                      }
                      keyboardType="numeric"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.lg,
    maxHeight: 400,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  list: {
    flex: 1,
  },
  overlayItem: {
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  overlayItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayType: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
  deleteButton: {
    fontSize: 20,
  },
  editor: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.border,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSize.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.xs,
  },
});

export default OverlayList;