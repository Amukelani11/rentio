import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  style,
  children,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '#E53237',
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: '#E53237',
          borderWidth: 0,
        };
    }
  };

  const getTextStyles = () => {
    const baseStyle = { color: '#FFFFFF' };
    switch (variant) {
      case 'outline':
        return { ...baseStyle, color: '#E53237' };
      case 'ghost':
        return { ...baseStyle, color: '#E53237' };
      default:
        return baseStyle;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
        };
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  };

  const styles = StyleSheet.create({
    button: {
      ...getVariantStyles(),
      ...getSizeStyles(),
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || loading ? 0.5 : 1,
    },
    text: {
      ...getTextStyles(),
      fontSize: getTextSize(),
      fontWeight: '600',
    },
  });

  return (
    <Pressable
      style={[styles.button, className, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextStyles().color} />
      ) : children || (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;