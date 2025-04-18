import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { View, Text, ScrollView, Animated,  TouchableOpacity} from 'react-native';
import { Tab } from '@rneui/themed';
import MathJaxSvg from 'react-native-mathjax-svg';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import formulaData from '@/assets/json/formulas2.json';

// Tipos
interface Formula {
  Area: string;
  subarea: string;
  formula: string;
  nome: string;
  variaveis: Record<string, string | undefined>;
  contexto: string;
}

interface FormulaItemProps {
  item: Formula;
}

// Componente de Loading
const FormulaShimmer = memo(() => (
  <View className="bg-white p-4 md:p-6 mb-5 rounded-2xl border border-[rgba(47,47,47,0.2)] md:mx-4">
    <ShimmerPlaceholder style={{ width: '100%', height: 24, marginBottom: 16 }} />
    <ShimmerPlaceholder style={{ width: '80%', height: 20, marginBottom: 12 }} />
    <ShimmerPlaceholder style={{ width: '90%', height: 40, marginBottom: 16 }} />
    <ShimmerPlaceholder style={{ width: '70%', height: 20, marginBottom: 12 }} />
    <View className="items-end">
      {[1, 2, 3].map((i) => (
        <ShimmerPlaceholder
          key={i}
          style={{ width: '60%', height: 16, marginBottom: 8 }}
        />
      ))}
    </View>
  </View>
));

const FormulaItem = memo(({ item }: FormulaItemProps) => (
  <View className="bg-white p-4 md:p-6 mb-5 rounded-2xl border border-[rgba(47,47,47,0.2)] md:mx-4">
    <Text className="font-semibold text-base md:text-lg text-[rgba(80,80,80,0.8)] uppercase pb-2 mb-2 border-b border-[rgba(203,203,203,0.5)]">
      {item.nome}
    </Text>

    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-[#6d6d6d] text-base md:text-base">Fórmula:</Text>
        <MathJaxSvg
          fontSize={16}
          color="#565555"
          style={{ marginVertical: 4 }}
        >
          {item.formula}
        </MathJaxSvg>
      </View>

      <View>
        <Text className="text-[#6d6d6d] text-base md:text-base mb-1">Variáveis:</Text>
        {Object.entries(item.variaveis).map(([key, value]) => (
          <View key={key} className="flex-row justify-end items-center mb-2 flex-wrap w-full">
            <MathJaxSvg
              fontSize={14}
              color="#565555"
              style={{ marginRight: 16 }}
            >
              {`${key}:`}
            </MathJaxSvg>
            <Text className="text-[#565555] text-sm md:text-base">{value}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text className="text-[#6d6d6d] text-base md:text-base mb-2">Contexto:</Text>
        <Text className="text-[#565555] text-sm md:text-base">{item.contexto}</Text>
      </View>
    </View>
  </View>
));

const FormulaList = memo(({ formulas, isLoading }: { formulas: Formula[], isLoading: boolean }) => (
  <View className="p-2 md:p-4">
    {isLoading ? (
      Array.from({ length: 3 }).map((_, index) => (
        <FormulaShimmer key={index} />
      ))
    ) : (
      formulas.map((item) => (
        <FormulaItem key={item.nome} item={item} />
      ))
    )}
  </View>
));

// Constantes
const FADE_DURATION = 100;

// Componente principal
const Formulas = () => {
  const [selectedArea, setSelectedArea] = useState(0);
  const [selectedSubarea, setSelectedSubarea] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Efeitos
  useEffect(() => {
    setFormulas(formulaData.formulas as Formula[]);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();

    return () => clearTimeout(timer);
  }, [selectedArea, selectedSubarea]);

  // Memos
  const areas = useMemo(() =>
    [...new Set(formulas.map(formula => formula.Area))],
    [formulas]
  );

  const subareas = useMemo(() =>
    [...new Set(formulas
      .filter(formula => formula.Area === areas[selectedArea])
      .map(formula => formula.subarea))
    ],
    [formulas, selectedArea, areas]
  );

  const filteredFormulas = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return formulas.filter(formula =>
      formula.Area === areas[selectedArea] &&
      formula.subarea === subareas[selectedSubarea] &&
      (formula.nome.toLowerCase().includes(searchLower) ||
        formula.formula.toLowerCase().includes(searchLower))
    );
  }, [formulas, selectedArea, selectedSubarea, searchQuery, areas, subareas]);

  // Handlers
  const handleAreaChange = useCallback((index: number) => {
    setSelectedArea(index);
    setSelectedSubarea(0);
  }, []);

  const handleSubareaChange = useCallback((index: number) => {
    setSelectedSubarea(index);
  }, []);


  return (
    <View className='flex-1 bg-white'>
      <View className="flex-1 gap-2">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Tab
            value={selectedArea}
            onChange={handleAreaChange}
            indicatorStyle={{ backgroundColor: 'transparent', height: 0 }}
            scrollable
            className="md:px-4"
          >
            {areas.map((area, index) => (
              <Tab.Item
                key={area}
                title={area}
                titleStyle={{
                  color: selectedArea === index ? '#fff' : '#818898',
                  fontSize: 14,
                  paddingHorizontal: 5,
                  paddingVertical: 4,
                }}
                containerStyle={{
                  backgroundColor: selectedArea === index ? '#7141A1' : '#ECEFF3',
                  borderRadius: 50,
                  margin: 2,
                  minHeight: 30,
                  height: 'auto',
                }}
              />
            ))}
          </Tab>

          <Tab
            value={selectedSubarea}
            onChange={handleSubareaChange}
            indicatorStyle={{ backgroundColor: 'transparent', height: 0 }}
            scrollable
            className="md:px-4"
          >
            {subareas.map((subarea, index) => (
              <Tab.Item
                key={subarea}
                title={subarea}
                titleStyle={{
                  color: selectedSubarea === index ? '#fff' : '#818898',
                  fontSize: 14,
                  paddingHorizontal: 5,
                  paddingVertical: 4,
                }}
                containerStyle={{
                  backgroundColor: selectedSubarea === index ? '#7141A1' : '#ECEFF3',
                  borderRadius: 50,
                  margin: 2,
                  minHeight: 30,
                  height: 'auto',
                }}
              />
            ))}
          </Tab>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 mt-[5%] mr-2 ml-2 md:mr-0 md:ml-0 md:mt-[3%]"
        >
          <FormulaList formulas={filteredFormulas} isLoading={isLoading} />
        </ScrollView>
      </View>
    </View>
  );
};

export default memo(Formulas);