import { Link, useLocalSearchParams } from 'expo-router';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { areas } from '@/components/fisica/calculadora/equations';

export default function SubareasScreen() {
  const { subarea: areaKey } = useLocalSearchParams();
  const subareas = areas[areaKey as string].subareas;

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.entries(subareas)}
        keyExtractor={([key]) => key}
        renderItem={({ item: [key, subarea] }) => (
          <Link href={`/fisica/calculadoras/${areaKey}/${key}`} style={styles.item}>
            <Text style={styles.title}>{subarea.name}</Text>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  item: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});