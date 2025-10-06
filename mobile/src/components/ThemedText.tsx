import { Text, TextProps } from 'react-native';
import { useTheme } from '../theme';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

const variantStyles: Record<TextVariant, { fontSize: number; lineHeight: number }> = {
  title: { fontSize: 28, lineHeight: 34 },
  subtitle: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
};

const fontWeightMap: Record<NonNullable<ThemedTextProps['weight']>, TextProps['style']> = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
};

export function ThemedText({ variant = 'body', weight = 'regular', style, ...props }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      {...props}
      style={[
        {
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
        },
        variantStyles[variant],
        fontWeightMap[weight],
        style,
      ]}
    />
  );
}
