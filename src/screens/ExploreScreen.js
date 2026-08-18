import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MovieCard from '../components/MovieCard';
import { fetchHomePageData } from '../api/scraper';
import { isTV } from '../utils/device';

export default function ExploreScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    async function loadExploreData() {
      const res = await fetchHomePageData();
      if (res && res.movies) {
        setMovies(res.movies);
      }
    }
    loadExploreData();
  }, []);

  const filteredMovies = movies.filter(m => {
    if (selectedType === 'movies') return !m.tags || !m.tags.includes('series');
    if (selectedType === 'series') return m.tags && m.tags.includes('series');
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Dropdowns Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterDropdown, selectedType !== 'all' && styles.filterDropdownActive]}
          onPress={() => setSelectedType(selectedType === 'movies' ? 'series' : selectedType === 'series' ? 'all' : 'movies')}
        >
          <Text style={styles.filterText}>
            {selectedType === 'movies' ? 'Filmovi ▾' : selectedType === 'series' ? 'Crtane Serije ▾' : 'Sve ▾'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterDropdown}>
          <Text style={styles.filterText}>Popular ▾</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterDropdown}>
          <Text style={styles.filterText}>Zadano ▾</Text>
        </TouchableOpacity>
      </View>

      {/* 3-Column Poster Grid */}
      <FlatList
        data={filteredMovies}
        numColumns={3}
        keyExtractor={(item, idx) => item.id || `exp-${idx}`}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <MovieCard movie={item} onPress={(m) => navigation.navigate('Detail', { movie: m })} />
          </View>
        )}
        contentContainerStyle={styles.gridContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A10'
  },
  filterBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D0E15'
  },
  filterDropdown: {
    backgroundColor: '#161823',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#242736'
  },
  filterDropdownActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#1E1B4B'
  },
  filterText: {
    color: '#E2E8F0',
    fontSize: isTV ? 15 : 13,
    fontWeight: '600'
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 80
  },
  gridItem: {
    flex: 1 / 3,
    padding: 6
  }
});
