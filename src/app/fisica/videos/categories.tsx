import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { FEATURED_VIDEOS } from '@/app/fisica/videos/VideoHome';

// Defina ou importe CATEGORIES
export const CATEGORIES = [
  { id: 'astronomiaIndigena', name: 'Astronomia Indígena' },
  { id: 'filosofia', name: 'Filosofia' },
  // ... outras categorias
];

export default function CategoriesScreen() {
  return (
    <ScrollView style={styles.container}>
      {CATEGORIES.map((category) => (
        <Link 
          key={category.id} 
          href={{
            pathname: `/fisica/videos/category/[id]`,
            params: { id: category.id, type: category.name }
          }}
          asChild
        >
          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.videoCount}>
              {FEATURED_VIDEOS[category.id]?.length || 0} vídeos
            </Text>
          </TouchableOpacity>
        </Link>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: 16,
    },
    categoryCard: {
      backgroundColor: '#fff',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: '600',
    },
    videoCount: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    gridItem: {
      flex: 1,
      minWidth: 300,
      maxWidth: '100%',
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    seeAll: {
      color: '#0066cc',
      fontSize: 14,
      fontWeight: '500',
    },
    card: {
      width: 200,
      marginHorizontal: 8,
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    loadingCard: {
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnail: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
  });