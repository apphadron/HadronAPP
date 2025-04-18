import { FlatList, Image, Text } from 'react-native';
import { CardItem } from '../../types/astronomia';
import {ThemedTouchableOpacity} from '@/components/geral/astro/ThemeComponents';
import { colors } from '@/styles/colors';

interface VerticalListProps {
  data: CardItem[];
  onItemPress: (item: CardItem) => void;
}

export function VerticalList({ data, onItemPress }: VerticalListProps) {
  return (
    <FlatList
      data={data}
      className="px-4"
      renderItem={({ item }) => (
        <ThemedTouchableOpacity
          onPress={() => onItemPress(item)}
          className="flex-row items-center rounded-xl p-4 mb-3"
          //style={{borderColor: colors.dark["--color-cinza-90"], borderWidth: 1}}
        >
          <Image
            source={typeof item.icon === 'string' ? { uri: item.icon } : item.icon}
            className="w-16 h-16 rounded-full"
            resizeMode='cover'
          />
          <Text className="ml-4 text-white text-lg font-medium">
            {item.title}
          </Text>
        </ThemedTouchableOpacity>
      )}
      keyExtractor={item => String(item.id)}
    />
  );
}