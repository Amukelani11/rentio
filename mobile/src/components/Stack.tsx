import { Children, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

type FlexAlign = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
type FlexJustify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

interface StackProps extends ViewProps {
  spacing?: number;
  direction?: 'vertical' | 'horizontal';
  align?: FlexAlign;
  justify?: FlexJustify;
  children: ReactNode;
}

export function Stack({
  children,
  spacing = 12,
  direction = 'vertical',
  align,
  justify,
  style,
  ...rest
}: StackProps) {
  const isRow = direction === 'horizontal';
  const validChildren = Children.toArray(children).filter(Boolean);

  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: isRow ? 'row' : 'column',
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {validChildren.map((child, index) => (
        <View
          key={index}
          style={
            isRow
              ? { marginRight: index === validChildren.length - 1 ? 0 : spacing }
              : { marginBottom: index === validChildren.length - 1 ? 0 : spacing }
          }
        >
          {child}
        </View>
      ))}
    </View>
  );
}
