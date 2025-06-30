import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-space-600 active:bg-space-700';
      case 'secondary':
        return 'bg-cosmic-600 active:bg-cosmic-700';
      case 'danger':
        return 'bg-red-600 active:bg-red-700';
      default:
        return 'bg-space-600 active:bg-space-700';
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case 'small':
        return 'px-3 py-2';
      case 'medium':
        return 'px-4 py-3';
      case 'large':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextSizeStyles = (): string => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const buttonStyles = `
    ${getVariantStyles()}
    ${getSizeStyles()}
    rounded-lg
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `.trim();

  const textStyles = `
    ${getTextSizeStyles()}
    font-bold
    text-white
    text-center
  `.trim();

  return (
    <TouchableOpacity
      className={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text className={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

