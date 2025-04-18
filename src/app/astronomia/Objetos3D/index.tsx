import { useState, useEffect } from 'react';
import { View, SafeAreaView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tab } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/db/supabaseClient';
import { VerticalList } from '@/components/astronomia/VerticalList';
import jupiter from '@/assets/astronomia/planetas/jupiter.png';
import { colors } from '@/styles/colors';

const DEFAULT_IMAGE = jupiter;
const CACHE_KEY = 'planet_screen_data';
const CACHE_EXPIRATION = 1000 * 60 * 60 * 24 * 5; // 5 dias

type CardItem = {
  id: string | number;
  icon: string;
  title: string;
  rota: string;
};

type TabData = {
  id: string;
  title: string;
  data: CardItem[];
};

export default function Objetos3DScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabsData, setTabsData] = useState<TabData[]>([]);

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (Date.now() - parsedData.timestamp < CACHE_EXPIRATION) {
            setTabsData(parsedData.data);
            return;
          }
        }
        fetchData();
      } catch (error) {
        console.error('Error loading cache:', error);
        fetchData();
      }
    };

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('objetos_3d')
          .select('id, nome, image_url, categoria');

        if (error) {
          console.error('Error fetching data from Supabase:', error);
          return;
        }

        const groupedData: Record<string, CardItem[]> = data.reduce((acc, item) => {
          if (!acc[item.categoria]) {
            acc[item.categoria] = [];
          }
          acc[item.categoria].push({
            id: item.id,
            icon: typeof item.image_url === 'string' && item.image_url.startsWith('http') ? { uri: item.image_url } : DEFAULT_IMAGE,
            title: item.nome,
            rota: `/${item.id}`,
          });
          return acc;
        }, {} as Record<string, CardItem[]>);

        const formattedTabs = Object.keys(groupedData).map((key) => ({
          id: key,
          title: key,
          data: groupedData[key],
        }));

        setTabsData(formattedTabs);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: formattedTabs, timestamp: Date.now() }));
      } catch (err) {
        console.error('Error:', err);
      }
    };

    loadCachedData();
  }, []);

  const handleItemPress = (item: CardItem) => {
    //console.log(item.icon);
    router.push({pathname: '/astronomia/Objetos3D/[id]', params: {id: item.id, type: item.title}});
  };

  const filteredData = tabsData[activeTab]?.data.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.dark["--color-cinza-100"] }}>
      <View className="flex-1 items-center">
        <Tab
          value={activeTab}
          onChange={setActiveTab}
          scrollable
          disableIndicator
          containerStyle={{ backgroundColor: 'transparent', width: '100%', height: 45 }}
          buttonStyle={{ padding: 0, minHeight: 0 }}
        >
          {tabsData.map((tab) => (
            <Tab.Item
              key={tab.id}
              title={tab.title}
              containerStyle={(active) => ({
                backgroundColor: active ? '#ffffff' : '#0b0c0d',
                borderRadius: 50,
                marginHorizontal: 4,
              })}
              titleStyle={(active) => ({ color: active ? '#000000' : '#ffffff', fontSize: 15 })}
            />
          ))}
        </Tab>

        <View className="flex-1 w-full mt-6">
          <VerticalList data={filteredData} onItemPress={handleItemPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}
