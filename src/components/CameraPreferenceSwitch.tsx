import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

type CameraPreferenceSwitchProps = {
  enabled: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function CameraPreferenceSwitch({ enabled, disabled, onPress }: CameraPreferenceSwitchProps) {
  const progress = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: enabled ? 1 : 0,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [enabled, progress]);

  const knobTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22]
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled }}
      style={({ pressed }) => [
        styles.cameraPreferenceRow,
        enabled && styles.cameraPreferenceRowActive,
        pressed && !disabled && styles.cameraPreferenceRowPressed,
        disabled && styles.disabledButton
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <View style={styles.cameraPreferenceTextArea}>
        <Text style={styles.fieldLabel}>Camera automatica</Text>
        <Text style={styles.meta}>Liga Ler NF e flash ao abrir a camera.</Text>
      </View>
      <View style={[styles.cameraPreferenceSwitchTrack, enabled && styles.cameraPreferenceSwitchTrackActive]}>
        <Animated.View style={[styles.cameraPreferenceSwitchKnob, { transform: [{ translateX: knobTranslateX }] }]} />
      </View>
    </Pressable>
  );
}
