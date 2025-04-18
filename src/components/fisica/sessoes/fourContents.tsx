import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import * as IconBackgound from '@/assets/icons/';
import { useRouter } from 'expo-router';

const FourContents = () => {
    const router = useRouter();

    return (
        <View className='flex-1 p-0 justify-center'>
            <View className='flex flex-row flex-wrap gap-4 items-center justify-center'>
                <Card
                    title="GLOSSÁRIO"
                    description="Não entende? A gente te explica!"
                    buttonText="ACESSAR"
                    IconComponent={IconBackgound.mulherLendo}
                    onPress={() => router.push("/fisica/glossario")}
                />
                <Card
                    title="UNIDADES"
                    description="Diz aí: quem você conhece?"
                    buttonText="ACESSAR"
                    IconComponent={IconBackgound.pessoaProcurando}
                    onPress={() => router.push("/fisica/unidadesDeMedidas")}
                />
                <Card
                    title="FÓRMULAS"
                    description="Muitas fórmulas, um lugar!"
                    buttonText="ACESSAR"
                    IconComponent={IconBackgound.estudanteEstressada}
                    onPress={() => router.push({ pathname: "/fisica/formulas", params: { type: "Fórmulas" } })}
                />
                <Card
                    title="CONHECENDO"
                    description="CIENTISTAS"
                    buttonText="ACESSAR"
                    IconComponent={IconBackgound.pessoaProcurando}
                />
            </View>
        </View>
    );
};

const Card = ({ title, description, buttonText, IconComponent, onPress }: any) => {
    return (
        <View className='relative items-center rounded-[16px] overflow-hidden h-56 p-3 w-[40%]'>
            
            {/* Fundo com gradiente radial */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient id="grad" cx="50%" cy="50%" r="80%">
                            <Stop offset="0%" stopColor="rgba(113,65,161,1)" stopOpacity="0.7" />
                            <Stop offset="100%" stopColor="rgba(113,65,161,1)" stopOpacity="1" />
                        </RadialGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            </View>

            {/* Conteúdo do Card */}
            <Text className='text-bold text-center font-poppins-semibold text-base text-white'>{title}</Text>
            <Text className='text-bold text-center font-poppins-medium text-sm text-white'>{description}</Text>

            {IconComponent && <IconComponent width={92} height={92} />}

            {buttonText ? (
                <TouchableOpacity className='w-[90%] items-center bg-white rounded-full px-[12px] py-[4px]' onPress={onPress}>
                    <Text style={{ color: "#7129A1" }} className='font-poppins-semibold text-base text-bold'>{buttonText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default FourContents;
