import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as Rover from '../../../assets/astronomia/rovers';

export function Objects3DBanner() {
    return (
        <View className="bg-[#243E4A] rounded-[10px] p-4 flex-row justify-between items-center max-w-[400px] h-[180px] mr-4 ml-4">
            <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold text-white mb-2 font-orbitron-medium">
                    VEJA EM 3D
                </Text>

                <Text className="text-base text-white mb-3 leading-[22px]">
                    Chega de fotos! Veja rovers, sondas e satelites em 3D e explore cada detalhe.
                </Text>

                <TouchableOpacity
                    className="bg-white px-6 py-2 rounded-lg items-center self-start"
                    activeOpacity={0.7}
                >
                    <Text className="text-[#243E4A] font-bold text-base">
                        EXPLORAR
                    </Text>
                </TouchableOpacity>
            </View>

            <Image
                source={Rover.Perseverance}
                className="w-[130px] h-[140px] "
                resizeMode="cover"
                style={{ transform: [{ scale: 1.2 }] }}
            />
        </View>
    );
}
