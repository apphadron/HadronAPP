import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightComponent,
  showBackButton = true
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-space-800 border-b border-space-600">
      <View className="flex-1">
        {showBackButton && onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center"
          >
            <Text className="text-white text-lg mr-2">←</Text>
            <Text className="text-white text-sm">Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View className="flex-2">
        <Text className="text-white text-lg font-bold text-center">
          {title}
        </Text>
      </View>
      
      <View className="flex-1 items-end">
        {rightComponent}
      </View>
    </View>
  );
};

