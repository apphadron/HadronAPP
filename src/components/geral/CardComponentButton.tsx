import { View, Text, Dimensions, ViewProps, TouchableOpacity, ImageBackground, ImageSourcePropType } from 'react-native';
import RealFakeImag from '@/assets/backgrounds/vectors/RealFakeImg';
import FundoRoxo from '@/assets/backgrounds/Bg_card_roxo.png';

interface CardComponentProps {
    titulo?: string;
    texto?: string;
    backgroundColor?: string;
    textColor?: string;
    image?: React.ReactNode;
    imageBackground?: ImageSourcePropType;
    style?: ViewProps['style'];
}

export function CardComponentButton({
    titulo = 'Título Padrão',
    texto = 'Texto Padrão',
    backgroundColor = '#FFFFFF',
    imageBackground = FundoRoxo,
    textColor = '#000000',
    image = <RealFakeImag width={85} height={85} />,
    style,
}: CardComponentProps) {
    return (
        <View style={{ alignItems: 'center', backgroundColor: 'red', paddingHorizontal: 16, paddingVertical: 12 }}>

            <ImageBackground style={{ width: '100%', height: 130, borderRadius: 8, overflow: 'hidden', shadowColor: 'black', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }} source={imageBackground} resizeMode='cover'>
                <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text
                        style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 8, lineHeight: 20, color: textColor }}
                    >
                        {titulo}
                    </Text>
                    <View className="flex-1">
                        <Text
                            className="text-sm font-poppins-regular leading-tight"
                            style={{ color: textColor }}
                        >
                            {texto}
                        </Text>
                    </View>

                    <View className='flex-row gap-1 items-center'>
                        <View className="mr-4">
                            {image}</View>
                        <View>
                            <TouchableOpacity className='bg-white w-24 px-2 py-1 rounded-full items-center'>
                                <Text>ACESSAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}
