import { FlatList, TouchableOpacity, Text, Image } from 'react-native';
import { CardItem } from '../../types/astronomia';

interface GridProps {
  data: CardItem[];
  onItemPress: (item: CardItem) => void;
}

export function Grid({ data, onItemPress }: GridProps) {
  return (
    <FlatList
      data={data}
      numColumns={2}
      className="px-4"
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onItemPress(item)}
          className="bg-gray-90 rounded-xl p-4 m-2 border border-gray-light border-1 w-[150px] h-[160px] items-center justify-center"
        >
          <Image
            source={item.icon}
            className="w-24 h-24"
            resizeMode="contain"
          />
          <Text className="text-gray-300 text-sm font-medium mt-2">
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={item => String(item.id)}
    />
  );
}