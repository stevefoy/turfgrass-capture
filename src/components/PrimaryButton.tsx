import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface PrimaryButtonProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  busy = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || busy;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View style={styles.contents}>
          <Ionicons color="#ffffff" name={icon} size={20} />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.56,
  },
  contents: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
