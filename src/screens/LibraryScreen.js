import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import MovieCard from '../components/MovieCard';
import { watchHistoryManager } from '../services/watchHistoryManager';
import { isTV } from '../utils/device';

export default function LibraryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const list = watchHistoryManager.getHistory();
    setHistory(list);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Moja Knjižnica</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Vaša knjižnica je prazna</Text>
          <Text style={styles.emptySubtitle}>Pogledani crtani filmovi automatski će se pojaviti ovdje.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          numColumns={3}
          keyExtractor={(item, idx) => item.id || `lib-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MovieCard movie={item} onPress={(m) => navigation.navigate('Detail', { movie: m })} />
            </View>
          )}
          contentContainerStyle={styles.gridContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A10'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0D0E15'
  },
  title: {
    color: '#FFFFFF',
    fontSize: isTV ? 20 : 16,
    fontWeight: '700'
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 80
  },
  gridItem: {
    flex: 1 / 3,
    padding: 6
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyTitle: {
    color: '#E2E8F0',
    fontSize: isTV ? 20 : 16,
    fontWeight: '700',
    marginBottom: 8
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: isTV ? 15 : 13,
    textAlign: 'center'
  }
});
