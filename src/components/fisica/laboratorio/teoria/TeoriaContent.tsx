import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Definição de interfaces para tipar nossos dados
export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface RelatedTool {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
}

export interface ReferenceItem {
  title: string;
  description: string;
}

export interface TeoriaContentProps {
  title: string;
  subtitle: string;
  tags: string[];
  sections: Section[];
  relatedTools: RelatedTool[];
  references: ReferenceItem[];
  headerBackgroundColor?: string;
}

export default function TeoriaContent({
  title,
  subtitle,
  tags,
  sections,
  relatedTools,
  references,
  headerBackgroundColor = 'bg-blue-500'
}: TeoriaContentProps) {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState('intro');

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: title,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#f9fafb' },
        }}
      />
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4 pt-2"
      >
        <View className={`${headerBackgroundColor} rounded-2xl p-5 mb-6`}>
          <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
          <Text className="text-blue-100 mb-4">
            {subtitle}
          </Text>
          <View className="flex-row flex-wrap">
            {tags.map((tag, index) => (
              <View key={index} className="bg-white/20 self-start px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-white text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {sections.map(section => (
          <View key={section.id} className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => toggleSection(section.id)}
            >
              <Text className="text-lg font-semibold text-gray-800">{section.title}</Text>
              <Feather
                name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#4b5563"
              />
            </TouchableOpacity>

            {expandedSection === section.id && (
              <View className="p-4 pt-0 border-t border-gray-100">
                <Text className="text-gray-700 leading-6">{section.content}</Text>
              </View>
            )}
          </View>
        ))}

        {relatedTools.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-3">Ferramentas relacionadas</Text>

            {relatedTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3 last:mb-0"
                onPress={() => router.push(tool.route as any)}
              >
                <View className="bg-blue-100 h-10 w-10 rounded-full items-center justify-center mr-3">
                  <MaterialCommunityIcons name={tool.icon as any} size={20} color="#2563eb"/>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">{tool.title}</Text>
                  <Text className="text-gray-600 text-sm">{tool.description}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#4b5563" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {references.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-3">Material complementar</Text>

            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-gray-700 mb-4">
                Para aprofundar seus conhecimentos sobre {title.toLowerCase()},
                recomendamos a consulta às seguintes referências:
              </Text>

              {references.map((ref, index) => (
                <View key={index} className={index < references.length - 1 ? "mb-2" : ""}>
                  <Text className="text-gray-800 font-medium">• {ref.title}</Text>
                  <Text className="text-gray-600 text-sm">{ref.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}