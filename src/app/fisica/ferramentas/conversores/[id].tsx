import React, { useState, useEffect } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/styles/colors";
import { useTheme } from "@/components/geral/ThemeContext";

// Função auxiliar para formatação de números
const formatNumber = (value: number): string => {
  if (Math.abs(value) < 0.0001 || Math.abs(value) >= 100000) {
    return value.toExponential(4);
  }
  
  // Para números com muitas casas decimais, limita a 4 casas
  if (value % 1 !== 0) {
    return Number(value.toFixed(4)).toString();
  }
  
  return value.toString();
};

// Definição das conversões com tipos mais específicos
type ConversionFunction = (value: number) => number;

interface ConversionMap {
  [key: string]: number | ConversionFunction | ConversionMap;
}

interface Conversions {
  [category: string]: ConversionMap;
}

export const conversions: Conversions = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    μm: 1e-6,
    nm: 1e-9,
    inch: 0.0254,
    foot: 0.3048,
    yard: 0.9144,
    mile: 1609.34,
    nauticalMile: 1852,
    lightYear: 9.461e15,
  },
  area: {
    m2: 1,
    km2: 1e6,
    cm2: 0.0001,
    mm2: 1e-6,
    hectare: 10000,
    acre: 4046.86,
    sqft: 0.092903,
    sqyd: 0.836127,
    sqmi: 2589988.11,
    sqin: 0.00064516,
  },
  volume: {
    m3: 1,
    km3: 1e9,
    cm3: 1e-6,
    mm3: 1e-9,
    l: 0.001,
    ml: 1e-6,
    gallon: 0.00378541,
    quart: 0.000946353,
    pint: 0.000473176,
    cup: 0.000236588,
    floz: 2.95735e-5,
    cuft: 0.0283168,
    cuin: 1.6387e-5,
  },
  mass: {
    g: 1,
    kg: 1000,
    mg: 0.001,
    μg: 1e-6,
    ton: 1e6,
    lb: 453.592,
    oz: 28.3495,
    grain: 0.0647989,
    stone: 6350.29,
  },
  time: {
    s: 1,
    ms: 0.001,
    μs: 1e-6,
    ns: 1e-9,
    min: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    month: 2.628e6,
    year: 3.156e7,
  },
  temperature: {
    K: (val: number) => val,
    degC: (val: number) => val + 273.15,
    degF: (val: number) => (val - 32) * 5/9 + 273.15,
    fromK: {
      K: (val: number) => val,
      degC: (val: number) => val - 273.15,
      degF: (val: number) => (val - 273.15) * 9/5 + 32,
    },
  },
  energy: {
    J: 1,
    kJ: 1000,
    cal: 4.184,
    kcal: 4184,
    Wh: 3600,
    kWh: 3.6e6,
    eV: 1.60218e-19,
    BTU: 1055.06,
    ftlb: 1.35582,
  },
  power: {
    W: 1,
    kW: 1000,
    MW: 1e6,
    hp: 745.7,
    BTUph: 0.29307,
    ftlbps: 1.35582,
  },
  pressure: {
    Pa: 1,
    kPa: 1000,
    MPa: 1e6,
    bar: 100000,
    atm: 101325,
    psi: 6894.76,
    torr: 133.322,
    mmHg: 133.322,
  },
  speed: {
    mps: 1,
    kmph: 0.277778,
    mph: 0.44704,
    knot: 0.514444,
    ftps: 0.3048,
    inps: 0.0254,
  },
  angle: {
    rad: 1,
    deg: Math.PI / 180,
    grad: Math.PI / 200,
    arcmin: Math.PI / 10800,
    arcsec: Math.PI / 648000,
  },
  frequency: {
    Hz: 1,
    kHz: 1000,
    MHz: 1e6,
    GHz: 1e9,
    rpm: 1/60,
  },
  dataSize: {
    B: 1,
    KB: 1024,
    MB: 1048576,
    GB: 1073741824,
    TB: 1099511627776,
  },
};

// Unidades especiais que precisam de conversão bidirecional
const specialUnits = ['temperature'];

export default function ConversoresScreen() {
  const { id } = useLocalSearchParams();
  const units = Object.keys(conversions[id as keyof typeof conversions] || {}) || [];
  const [fromUnit, setFromUnit] = useState<string>(units[0] || "");
  const [toUnit, setToUnit] = useState<string>(units[1] || units[0] || "");
  const [value, setValue] = useState<string>("1");
  const [convertedValue, setConvertedValue] = useState<string>("");
  const {isLight} = useTheme();

  const convert = (value: number, fromUnit: string, toUnit: string, category: string) => {
    const conversionTable = conversions[category];
    
    if (specialUnits.includes(category)) {
      // Tratamento especial para temperatura
      if (category === 'temperature') {
        const toKelvin = conversionTable[fromUnit] as ConversionFunction;
        const kelvinValue = toKelvin(value);
        const fromKelvin = (conversionTable as any).fromK[toUnit];
        return fromKelvin(kelvinValue);
      }
    } else {
      // Conversão normal usando fatores de conversão
      const fromFactor = conversionTable[fromUnit] as number;
      const toFactor = conversionTable[toUnit] as number;
      return (value * fromFactor) / toFactor;
    }
  };

  useEffect(() => {
    if (value && fromUnit && toUnit && id) {
      try {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
          setConvertedValue("Entrada inválida");
          return;
        }

        if (fromUnit === toUnit) {
          setConvertedValue(value);
        } else {
          const result = convert(parsedValue, fromUnit, toUnit, id as string);
          setConvertedValue(formatNumber(result));
        }
      } catch (err) {
        setConvertedValue("Erro na conversão");
      }
    }
  }, [value, fromUnit, toUnit, id]);

  return (
    <KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
>
    <View className="flex-1 items-center" style={{backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"]}} >
      <View className="flex-row p-4 gap-0 mt-5">
        <TextInput
          className="w-[60%] h-[60px] border border-gray-300 p-2 rounded-bl-[50px] rounded-tl-[50px] text-[20px] text-center text-[black]/90"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          placeholder="Digite o valor"
        />

        <View
          className="flex-1 rounded-br-[50px] rounded-tr-[50px] overflow-hidden"
          style={{ backgroundColor: colors.light["--color-roxo-100"] }}
        >
          <Picker
            selectedValue={fromUnit}
            style={{
              flex: 1,
              color: colors.default["--color-branco"],
            }}
            onValueChange={setFromUnit}
            mode="dropdown"
            dropdownIconColor={colors.default["--color-branco"]}
          >
            {units.map((unit) => (
              <Picker.Item key={unit} label={unit} value={unit} />
            ))}
          </Picker>
        </View>
      </View>

      <View className="flex-row p-4 gap-0">
        <TextInput
          className="w-[60%] h-[60px] border border-gray-300 p-2 rounded-bl-[50px] rounded-tl-[50px] text-[20px] text-center text-[black]/90"
          value={convertedValue}
          editable={false}
        />

        <View
          className="flex-1 rounded-br-full rounded-tr-full overflow-hidden"
          style={{ backgroundColor: colors.light["--color-roxo-100"] }}
        >
          <Picker
            selectedValue={toUnit}
            style={{
              flex: 1,
              color: colors.default["--color-branco"],
            }}
            onValueChange={setToUnit}
            mode="dropdown"
            dropdownIconColor={colors.default["--color-branco"]}
          >
            {units.map((unit) => (
              <Picker.Item key={unit} label={unit} value={unit} />
            ))}
          </Picker>
        </View>
      </View>
    </View>

    </KeyboardAvoidingView>
  );
}