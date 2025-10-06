import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';
import { useTheme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ title, variant = 'primary', loading, style, disabled, ...props }: ButtonProps) {
  const theme = useTheme();

  const baseStyle = {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  };

  const variantStyle = (() => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.colors.secondary };
      case 'ghost':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E5E7EB' };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  })();

  const textColor = variant === 'ghost' ? '#000000' : theme.colors.primaryForeground;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        baseStyle,
        variantStyle,
        pressed ? { opacity: 0.85 } : null,
        disabled ? { opacity: 0.6 } : null,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontWeight: '600',
            fontSize: 16,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
