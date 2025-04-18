import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface WordSearchGridProps {
  grid: string[][];
  onTilePress: (x: number, y: number) => void;
}

const WordSearchGrid: React.FC<WordSearchGridProps> = ({ grid, onTilePress }) => {
  console.log('Grid no WordSearchGrid:', grid); // Verifique o grid recebido

  if (!grid || grid.length === 0 || !grid.every(row => row.length === grid[0].length)) {
    return <Text>Erro ao carregar o grid. Tente novamente.</Text>;
  }

  return (
    <View style={styles.grid}>
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((letter, x) => (
            <TouchableOpacity key={x} onPress={() => onTilePress(x, y)} style={styles.tile}>
              <Text style={styles.text}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WordSearchGrid;
