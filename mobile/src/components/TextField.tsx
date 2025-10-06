import { forwardRef } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme';
import { ThemedText } from './ThemedText';

type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, helperText, style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View>
        {label ? (
          <ThemedText
            weight="semibold"
            variant="caption"
            style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.xs }}
          >
            {label}
          </ThemedText>
        ) : null}
        <TextInput
          ref={ref}
          {...props}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            {
              height: 48,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
            },
            style,
          ]}
        />
        {helperText ? (
          <ThemedText
            variant="caption"
            style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}
          >
            {helperText}
          </ThemedText>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = 'TextField';
