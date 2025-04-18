import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <SafeAreaView className="bg-black h-20 justify-center">
      <View className="flex-row items-center justify-center h-14 ">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute left-4 z-10"
        >
          <Ionicons name="arrow-back" size={24} className="text-white" color="white"/>
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-white font-orbitron">
          {title}
        </Text>
      </View>
    </SafeAreaView>
  )
}