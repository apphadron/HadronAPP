import React from 'react';
import { View, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function HeaderAstronomia() {
    return (
            <View className="flex-row justify-between items-center p-4">
                <Text className="font-orbitron-medium text-2xl text-white">Astronomia</Text>
                <Icon name="lightbulb-on-outline" size={25} color="white" className='mr-2' />
            </View>
    );
}