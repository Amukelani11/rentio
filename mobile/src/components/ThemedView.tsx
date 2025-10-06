import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme';

type ThemedViewProps = ViewProps & {
  surface?: boolean;
  surfaceMuted?: boolean;
  bordered?: boolean;
};

export function ThemedView({ surface, surfaceMuted, bordered, style, ...props }: ThemedViewProps) {
  const theme = useTheme();

  const backgroundColor = surface
    ? theme.colors.surface
    : surfaceMuted
    ? theme.colors.surfaceMuted
    : theme.colors.background;

  return (
    <View
      {...props}
      style={[
        { backgroundColor },
        bordered ? { borderColor: theme.colors.border, borderWidth: 1 } : null,
        style,
      ]}
    />
  );
}
