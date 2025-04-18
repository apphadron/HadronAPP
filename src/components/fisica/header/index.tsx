import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/components/geral/ThemeContext';
import { colors } from '@/styles/colors';

export function HeaderFisica() {
    const { isLight } = useTheme();
    return (
            <View className="flex-row justify-between items-center p-3">
                <Text
                    style={{ color: isLight ? colors.default["--color-preto"] : colors.default["--color-branco"] }}
                    className="font-orbitron font-semibold text-2xl ml-3">HADRON</Text>

                <Icon
                    style={{ color: isLight ? colors.default["--color-preto"] : colors.default["--color-branco"] }}
                    className='mr-2' name="lightbulb-on-outline" size={25} color="black" />
            </View>
    );
}