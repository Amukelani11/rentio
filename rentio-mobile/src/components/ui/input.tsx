import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { cn } from '../../lib/utils';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  className?: string;
  style?: any;
  multiline?: boolean;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  className,
  style,
  multiline,
}) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: '#F5F5F5',
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: error ? '#DC2626' : '#E5E7EB',
    },
    error: {
      color: '#DC2626',
      fontSize: 14,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, className, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default Input;