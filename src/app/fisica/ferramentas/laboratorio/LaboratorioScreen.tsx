import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Animated, FlatList } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tab, TabView } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/colors';

const { width, height } = Dimensions.get('window');
const cardWidth = width * 0.75;
const CARD_SPACING = 12;

export default function LaboratorioScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const tabs = [
    { id: 'calculadoras', label: 'Calculadoras', icon: 'calculator-variant' },
    { id: 'sensores', label: 'Sensores', icon: 'gauge' },
    { id: 'teoria', label: 'Teoria', icon: 'book-open-variant' }
  ];

  const calculadoras = [
    {
      id: 'prop-erro',
      title: 'Propagação de Erro',
      icon: 'function-variant',
      description: 'Calcule a propagação de erros em diferentes operações',
      route: '/fisica/ferramentas/laboratorio/calculadoras/Prop2',
      color: '#4F46E5',
    },
    {
      id: 'desvio-padrao',
      title: 'Desvio Padrão',
      icon: 'sigma',
      description: 'Calcule desvio padrão e erro padrão da média',
      route: '/laboratorio/calculadoras/desvio-padrao',
      color: '#0EA5E9',
    },
    {
      id: 'conversao-unidades',
      title: 'Conversão de Unidades',
      icon: 'swap-horizontal',
      description: 'Converta entre diferentes unidades físicas',
      route: '/laboratorio/calculadoras/conversao-unidades',
      color: '#8B5CF6',
    },
    {
      id: 'regressao-linear',
      title: 'Regressão Linear',
      icon: 'chart-line',
      description: 'Ajuste de curvas e regressão linear para dados experimentais',
      route: '/laboratorio/calculadoras/regressao-linear',
      color: '#EC4899',
    },
    {
      id: 'calculadora-incerteza',
      title: 'Incerteza Combinada',
      icon: 'percent',
      description: 'Calcule incertezas combinadas em medições',
      route: '/laboratorio/calculadoras/incerteza-combinada',
      color: '#F59E0B',
    },
    {
      id: 'algarismos-significativos',
      title: 'Algarismos Significativos',
      icon: 'numeric',
      description: 'Operações com algarismos significativos',
      route: '/laboratorio/calculadoras/algarismos-significativos',
      color: '#10B981',
    },
  ];

  const sensores = [
    {
      id: 'acelerometro',
      title: 'Acelerômetro',
      icon: 'speedometer',
      description: 'Use o acelerômetro do dispositivo para experimentos',
      route: '/fisica/ferramentas/laboratorio/sensores/Acelerometro',
      color: '#3B82F6',
    },
    {
      id: 'giroscopio',
      title: 'Giroscópio',
      icon: 'rotate-3d',
      description: 'Meça a rotação do dispositivo em diferentes eixos',
      route: '/laboratorio/sensores/giroscopio',
      color: '#8B5CF6',
    },
    {
      id: 'magnetometro',
      title: 'Magnetômetro',
      icon: 'compass',
      description: 'Meça campos magnéticos usando seu dispositivo',
      route: '/laboratorio/sensores/magnetometro',
      color: '#EC4899',
    },
    {
      id: 'barometro',
      title: 'Barômetro',
      icon: 'weather-partly-cloudy',
      description: 'Meça a pressão atmosférica (se disponível)',
      route: '/laboratorio/sensores/barometro',
      color: '#F59E0B',
    },
  ];

  const teoria = [
    {
      id: 'erros-experimentais',
      title: 'Erros Experimentais',
      icon: 'alert-circle-outline',
      description: 'Entenda os tipos de erros, como medi-los e lidar com eles ',
      route: '/fisica/ferramentas/laboratorio/teoria/ErrosExperimentais',
      color: '#EF4444',
    },
    {
      id: 'propagacao-erros',
      title: 'Propagação de Erros',
      icon: 'function',
      description: 'Como os erros se propagam em diferentes operações',
      route: '/laboratorio/teoria/propagacao-erros',
      color: '#8B5CF6',
    },
    {
      id: 'grandezas-fisicas',
      title: 'Grandezas Físicas',
      icon: 'ruler',
      description: 'Conceitos fundamentais sobre grandezas físicas',
      route: '/laboratorio/teoria/grandezas-fisicas',
      color: '#10B981',
    },
    {
      id: 'metodo-cientifico',
      title: 'Método Científico',
      icon: 'flask',
      description: 'Etapas e aplicação do método científico',
      route: '/laboratorio/teoria/metodo-cientifico',
      color: '#3B82F6',
    },
    {
      id: 'estatistica-basica',
      title: 'Estatística Básica',
      icon: 'chart-bell-curve',
      description: 'Conceitos de estatística para análise de dados',
      route: '/laboratorio/teoria/estatistica-basica',
      color: '#F59E0B',
    },
    {
      id: 'analise-grafica',
      title: 'Análise Gráfica',
      icon: 'chart-scatter-plot',
      description: 'Como interpretar e construir gráficos',
      route: '/laboratorio/teoria/analise-grafica',
      color: '#EC4899',
    },
  ];

  const infoCards = [
    {
      id: 'tip1',
      title: 'Dica do dia',
      content: 'Sempre registre as unidades ao lado de cada medida realizada em laboratório',
      icon: 'lightbulb-outline',
      color: '#F59E0B'
    },
    {
      id: 'fact1',
      title: 'Você sabia?',
      content: 'O Teorema do Limite Central explica por que muitos erros experimentais seguem a distribuição normal',
      icon: 'brain',
      color: '#8B5CF6'
    },
    {
      id: 'tool1',
      title: 'Ferramenta recente',
      content: 'A calculadora de propagação de erros foi atualizada com novas funções',
      icon: 'new-box',
      color: '#10B981'
    }
  ];

  const renderCarouselItem = ({ item, index: itemIndex }: { item: any; index: number }) => {
    // Interpolate for carousel effect
    const inputRange = [
      (itemIndex - 1) * (cardWidth + CARD_SPACING),
      itemIndex * (cardWidth + CARD_SPACING),
      (itemIndex + 1) * (cardWidth + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => router.push(item.route)}
        activeOpacity={0.9}
      >
        <Animated.View
          style={{
            width: cardWidth,
            transform: [{ scale }],
            opacity,
          }}
          className="bg-white rounded-3xl overflow-hidden shadow-lg h-46"
        >
          <LinearGradient
            colors={[item.color, `${item.color}99`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-4 justify-between"
          >
            <View className='flex-row gap-2 items-center'>
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                <MaterialCommunityIcons name={item.icon} size={30} color="white" />
              </View>

              <Text className="text-white text-xl font-bold">{item.title}</Text>
            </View>

            <View>
              <Text className="text-white/80 text-base">{item.description}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderInfoCard = (item: any) => (
    <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 flex-row items-center shadow-sm">
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${item.color}20` }}>
        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-gray-800 text-base">{item.title}</Text>
        <Text className="text-gray-600 text-sm">{item.content}</Text>
      </View>
    </View>
  );

  const renderGridItems = (data: any) => {
    return (
      <View className="flex-row flex-wrap justify-between px-4 mt-2">
        {data.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-2xl mb-4 overflow-hidden"
            style={{
              width: width * 0.44,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3
            }}
            onPress={() => router.push(item.route)}
          >
            <LinearGradient
              colors={[item.color, `${item.color}99`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-24 p-4 justify-center items-center"
            >
              <View className="bg-white/20 h-14 w-14 rounded-full items-center justify-center">
                <MaterialCommunityIcons name={item.icon} size={28} color="white" />
              </View>
            </LinearGradient>
            <View className="p-4">
              <Text className="text-md font-bold text-gray-800 mb-1">{item.title}</Text>
              <Text className="text-sm text-gray-600" numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Obter os dados correspondentes ao índice da tab atual
  const getCurrentData = () => {
    switch (index) {
      case 0: return calculadoras;
      case 1: return sensores;
      case 2: return teoria;
      default: return calculadoras;
    }
  };



  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <LinearGradient
        colors={[colors.light["--color-roxo-90"], colors.light["--color-roxo-80"], colors.light["--color-roxo-80"]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-4 px-3 "
      >
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-3xl font-bold text-white">Laboratório</Text>
            <Text className="text-base text-white">Experimente, meça, aprenda</Text>
          </View>
          <TouchableOpacity className="bg-white/20 h-10 w-10 rounded-full items-center justify-center">
            <MaterialCommunityIcons name="information-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{ backgroundColor: 'white', height: 3, borderRadius: 3 }}
          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
        >
          {tabs.map((tab, tabIndex) => (
            <Tab.Item
              key={tab.id}
              title={tab.label}
              icon={
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={20}
                  color="white"
                />
              }
              titleStyle={{
                color: 'white',
                fontSize: 14,
                flexShrink: 0,
                paddingHorizontal: 0
              }}
              containerStyle={{
                backgroundColor: index === tabIndex ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                //borderRadius: 8,
                marginHorizontal: 0,
                paddingVertical: 4
              }}
            />
          ))}
        </Tab>
      </LinearGradient>

      {/* Conteúdo da tab atual - usando apenas uma ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Carousel destacado */}
        <View className="mt-6">
          <Text style={{color: colors.default["--color-texto"]}} className="text-xl font-bold px-4 mb-2">
            Destaques
          </Text>
          <Animated.FlatList
            horizontal
            data={getCurrentData().slice(0, 3)}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: (width - cardWidth) / 4 - CARD_SPACING}}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
          />
        </View>

        {/* Info Cards */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold mb-3" style={{color: colors.default["--color-texto"]}}>
            Dicas e novidades
          </Text>
          {infoCards.map(renderInfoCard)}
        </View>

        {/* Grid Items */}
        <View className="mt-4">
          <Text className="text-xl font-bold px-6 mb-2" style={{color: colors.default["--color-texto"]}}>
            Todas as ferramentas
          </Text>
          {renderGridItems(getCurrentData())}
        </View>
      </ScrollView>

    </View>
  );
}