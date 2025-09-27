import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cn } from '../../lib/utils';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
  style?: any;
}

const Badge: React.FC<BadgeProps> = ({ text, variant = 'default', className, style }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#F3F4F6',
          textColor: '#6B7280',
        };
      case 'success':
        return {
          backgroundColor: '#D1FAE5',
          textColor: '#065F46',
        };
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          textColor: '#92400E',
        };
      case 'error':
        return {
          backgroundColor: '#FEE2E2',
          textColor: '#991B1B',
        };
      default:
        return {
          backgroundColor: '#FEE2E2',
          textColor: '#991B1B',
        };
    }
  };

  const styles = StyleSheet.create({
    badge: {
      ...getVariantStyles(),
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
      color: getVariantStyles().textColor,
    },
  });

  return (
    <View style={[styles.badge, className, style]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Badge;