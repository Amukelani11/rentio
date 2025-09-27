import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}

const Card: React.FC<CardProps> = ({ children, className, style }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  });

  return (
    <View style={[styles.card, className, style]}>
      {children}
    </View>
  );
};

export default Card;