import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';
import { useTheme } from '../theme';

interface ScreenProps {
  children: ReactNode;
  padded?: boolean;
  scrollable?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  background?: 'default' | 'surface' | 'surfaceMuted';
}

export function Screen({
  children,
  padded = true,
  scrollable,
  statusBarStyle,
  background = 'default',
}: ScreenProps) {
  const theme = useTheme();

  const backgroundColor =
    background === 'surface'
      ? theme.colors.surface
      : background === 'surfaceMuted'
      ? theme.colors.surfaceMuted
      : theme.colors.background;

  const containerStyle = {
    flex: 1,
    paddingHorizontal: padded ? theme.spacing.lg : 0,
    paddingTop: padded ? theme.spacing.xl : 0,
    paddingBottom: padded ? theme.spacing.xl : 0,
  } as const;

  const content = <View style={containerStyle}>{children}</View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar
        barStyle={statusBarStyle ?? (theme.mode === 'dark' ? 'light-content' : 'dark-content')}
        backgroundColor={backgroundColor}
      />
      {scrollable ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
