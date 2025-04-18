import { colors } from '@/styles/colors';
import { View, Text, Dimensions } from 'react-native';
import RealFakeImag from '@/assets/backgrounds/vectors/RealFakeImg';

export function VerdadeFake() {
    const isTrue = true;
    const statusText = isTrue ? "VERDADE" : "FAKE";
    const statusColor = isTrue ? "#10B981" : "#EF4444";
    const screenWidth = Dimensions.get('window').width;

    return (
        <View className="items-center px-4 py-3">
            {/* Card Principal com Sombra */}
            <View
                className="w-full rounded-2xl overflow-hidden shadow-lg"
                style={{
                    backgroundColor: 'white',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                }}
            >
                {/* Cabeçalho com cor de destaque */}
                <View
                    className="w-full py-2 px-5"
                    style={{ backgroundColor: colors.light["--color-roxo-80"] }}
                >
                    <Text
                        className="text-base font-poppins-bold text-center tracking-wide"
                        style={{ color: 'white' }}
                    >
                        VERDADE OU FAKE?
                    </Text>
                </View>

                {/* Conteúdo Principal */}
                <View className="flex-col">
                    <View className="">
                        <View className="flex-row items-center ">
                            <View className="mr-4">
                                <RealFakeImag width={85} height={85} />
                            </View>

                            {/* Container de texto e tag */}
                            <View className="flex-1 mt-2">
                                <Text
                                    className="text-base font-poppins-semibold mb-2 leading-tight"
                                    style={{ color: colors.light["--color-roxo-90"] }}
                                >
                                    A Matéria Escura Comanda o Universo
                                </Text>

                                {/* Texto com full width */}
                                <Text
                                    className="text-sm font-poppins-regular leading-tight mb-1" 
                                    style={{ color: colors.default["--color-texto"] }}
                                >
                                    Cerca de 85% da matéria do universo é composta por matéria escura, uma substância invisível que não interage com a luz. Sua presença é inferida pelos efeitos gravitacionais que exerce sobre a matéria visível.
                                </Text>

                                {/* Container da tag alinhada à direita */}
                                <View className="flex-row justify-end ">
                                    <View
                                        className="px-3 py-1 rounded-tl-full"
                                        style={{
                                            backgroundColor: statusColor,
                                        }}
                                    >
                                        <Text className="text-white font-poppins-bold text-base">
                                            {statusText}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}