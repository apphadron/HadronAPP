import { View, Text, Dimensions, ViewProps } from 'react-native';
import RealFakeImag from '@/assets/backgrounds/vectors/RealFakeImg';

interface CardComponentProps {
    titulo?: string;
    texto?: string;
    backgroundColor?: string;
    textColor?: string;
    image?: React.ReactNode;
    style?: ViewProps['style'];
}

export function CardComponent({
    titulo = 'Título Padrão',
    texto = 'Texto Padrão',
    backgroundColor = '#FFFFFF',
    textColor = '#000000',
    image = <RealFakeImag width={85} height={85} />, 
    style,
}: CardComponentProps) {
    return (
        <View className="items-center px-4 py-3">
            <View
                className="w-full rounded-2xl overflow-hidden shadow-lg"
                style={[{ backgroundColor, elevation: 5 }, style]}
            >
                <View className="p-4 items-center">
                    <Text
                        className="text-base font-poppins-semibold mb-2 leading-tight"
                        style={{ color: textColor }}
                    >
                        {titulo}
                    </Text>
                    <View className="flex-row items-center">
                        <View className="mr-4">{image}</View>
                        <View className="flex-1">
                            <Text
                                className="text-sm font-poppins-regular leading-tight"
                                style={{ color: textColor }}
                            >
                                {texto}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
