import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import LottieView from 'lottie-react-native';
import { Link } from 'expo-router'
import StarsBackground from '@/components/fisica/cards/astronomia';
import HomeISS from '@/assets/anim/ISS2.json';
import IconFoguete from '@/assets/icons/foguete';
import { Image } from 'expo-image';


export function CardAstronomia() {
    const lottieAnimation = useMemo(() => (
        <LottieView
            source={HomeISS}
            autoPlay
            loop
            cacheComposition={true}
            style={{ width: 150, height: 150 }}
            renderMode="SOFTWARE"
            resizeMode="contain"
        />

    ), []);

    

    return (
        <View className='items-center'>
            <View className="w-96 h-60 overflow-hidden rounded-[20px] ml-[10%] mr-[10%]">
                <StarsBackground />
                <View className="w-full h-full absolute flex-row p-4">
                    <View className="w-[65%] h-full justify-between ">
                        <View className='gap-2'>
                            <Text className="font-orbitron-semibold text-white text-[20px]">
                                ASTRONOMIA
                            </Text>
                            <Text className="w-full font-poppins-medium text-white text-[11px] leading-tight">
                                A astronomia nunca foi tão acessível. Visualize planetas,
                                estrelas e galáxias em 3D, acompanhe o sistema solar em
                                tempo real e realize seus próprios cálculos astronômicos.
                                Tudo isso ao alcance da sua mão.
                            </Text>
                        </View>
                        <Link href={"/astronomia/(tabs)/HomeAstronomia?disableHeader=true"} asChild>
                            <TouchableOpacity
                                className="bg-white rounded-[50px] p-2 flex-row items-center w-[127px] h-[32px] justify-center gap-2"
                            >
                                <Text className="font-orbitron-medium text-black text-[12px]">
                                    DECOLAR
                                </Text>
                                <IconFoguete />
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <View className=" w-[35%] flex-1 justify-center items-center">
                        {/*lottieAnimation*/}
                    </View>
                </View>
            </View>
        </View>
    );
}