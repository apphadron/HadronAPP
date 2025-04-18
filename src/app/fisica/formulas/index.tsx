import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Tab } from '@rneui/themed';
import MathJaxSvg from 'react-native-mathjax-svg';
import formulaData from '@/assets/json/formulas2.json';
import Sheet from '@/components/geral/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  onPress: (formula: Formula) => void;
}

// Componente de item de fórmula (apenas o nome como TouchableOpacity)
const FormulaItem = memo(({ item, onPress }: FormulaItemProps) => (
  <TouchableOpacity 
    className="bg-white p-4 md:p-6 mb-5 rounded-2xl border border-[rgba(47,47,47,0.2)] md:mx-4"
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <Text className="font-semibold text-base md:text-lg text-[rgba(80,80,80,0.8)] uppercase">
      {item.nome}
    </Text>
  </TouchableOpacity>
));

// Componente de detalhes da fórmula para o Sheet
const FormulaDetails = memo(({ formula }: { formula: Formula }) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    <Text style={styles.title}>{formula.nome}</Text>
    
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-[#6d6d6d] text-base md:text-base">Fórmula:</Text>
        <MathJaxSvg
          fontSize={16}
          color="#565555"
          style={{ marginVertical: 4 }}
        >
          {formula.formula}
        </MathJaxSvg>
      </View>

      <View>
        <Text className="text-[#6d6d6d] text-base md:text-base mb-1">Variáveis:</Text>
        {Object.entries(formula.variaveis).map(([key, value]) => (
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
        <Text className="text-[#565555] text-sm md:text-base">{formula.contexto}</Text>
      </View>
    </View>
  </ScrollView>
));

const FormulaList = memo(({ formulas, onFormulaPress }: { 
  formulas: Formula[], 
  onFormulaPress: (formula: Formula) => void
}) => (
  <View className="p-2 md:p-4">
    {formulas.map((item) => (
      <FormulaItem key={item.nome} item={item} onPress={onFormulaPress} />
    ))}
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
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const handleFormulaPress = useCallback((formula: Formula) => {
    setSelectedFormula(formula);
    setIsSheetOpen(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setIsSheetOpen(false);
    // Limpar a fórmula selecionada após o fechamento
    setTimeout(() => setSelectedFormula(null), 300);
  }, []);

  return (
    <View className='flex-1 bg-white'>
     <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1">
        <View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Tab
            value={selectedArea}
            onChange={handleAreaChange}
            indicatorStyle={{ backgroundColor: 'transparent' }}
            scrollable
            className="mb-2"
          >
            {areas.map((area, index) => (
              <Tab.Item
                key={area}
                title={area}
                titleStyle={{
                  color: selectedArea === index ? '#fff' : '#818898',
                  fontSize: 14,
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                }}
                containerStyle={{
                  backgroundColor: selectedArea === index ? '#7141A1' : '#f0f0f0',
                  borderRadius: 50,
                  margin: 2,
                }}
              />
            ))}
          </Tab>

          <Tab
            value={selectedSubarea}
            onChange={handleSubareaChange}
            indicatorStyle={{ backgroundColor: 'transparent', height: 0 }}
            scrollable
          >
            {subareas.map((subarea, index) => (
              <Tab.Item
                key={subarea}
                title={subarea}
                titleStyle={{
                  color: selectedSubarea === index ? '#fff' : '#818898',
                  fontSize: 14,
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                }}
                containerStyle={{
                  backgroundColor: selectedSubarea === index ? '#7141A1' : '#f0f0f0',
                  borderRadius: 50,
                  margin: 2,
                  minHeight: 30,
                  height: 'auto',
                }}
              />
            ))}
          </Tab>
        </Animated.View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 mt-[2%] mr-2 ml-2 md:mr-0 md:ml-0 md:mt-[3%]"
        >
          <FormulaList 
            formulas={filteredFormulas} 
            //isLoading={isLoading} 
            onFormulaPress={handleFormulaPress} 
          />
        </ScrollView>
      </View>

      {/* Sheet reutilizável para detalhes da fórmula */}
      {isSheetOpen && selectedFormula && (
        <Sheet 
          onClose={handleSheetClose}
          height={500} // Você pode ajustar a altura conforme necessário
        >
          <FormulaDetails formula={selectedFormula} />
        </Sheet>
      )}
      </GestureHandlerRootView>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default memo(Formulas);