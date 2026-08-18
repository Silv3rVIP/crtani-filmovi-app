import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MovieCard from '../components/MovieCard';
import { firebaseService } from '../services/firebase';
import { isTV } from '../utils/device';

function FilterPill({ label, isActive, onPress }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[
        styles.filterDropdown,
        isActive && styles.filterDropdownActive,
        isFocused && styles.filterDropdownFocused
      ]}
    >
      <Text style={[styles.filterText, isFocused && styles.filterTextFocused]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadBatch = async (reset = false) => {
    if (loading) return;
    if (!reset && !hasMore) return;

    setLoading(true);
    const currentOffset = reset ? 0 : offset;
    const res = await firebaseService.getPaginatedCartoons(30, currentOffset, selectedFilter);

    if (res) {
      if (reset) {
        setMovies(res.items);
        setOffset(30);
      } else {
        setMovies(prev => [...prev, ...res.items]);
        setOffset(prev => prev + 30);
      }
      setHasMore(res.hasMore);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBatch(true);
  }, [selectedFilter]);

  const handleFilterToggle = () => {
    if (selectedFilter === 'all') setSelectedFilter('dugi_crtani');
    else if (selectedFilter === 'dugi_crtani') setSelectedFilter('serija');
    else if (selectedFilter === 'serija') setSelectedFilter('sinhronizovano');
    else if (selectedFilter === 'sinhronizovano') setSelectedFilter('staricrtaci');
    else setSelectedFilter('all');
  };

  const getFilterLabel = () => {
    if (selectedFilter === 'dugi_crtani') return 'Dugi Filmovi ▾';
    if (selectedFilter === 'serija') return 'Crtane Serije ▾';
    if (selectedFilter === 'sinhronizovano') return 'Sinhronizovano ▾';
    if (selectedFilter === 'staricrtaci') return 'Stari Crtani ▾';
    return 'Sve ▾';
  };

  return (
    <View style={styles.container}>
      {/* Top Filter Bar */}
      <View style={styles.filterBar}>
        <FilterPill label={getFilterLabel()} isActive={selectedFilter !== 'all'} onPress={handleFilterToggle} />
        <FilterPill label="Popular ▾" isActive={false} onPress={() => {}} />
        <FilterPill label="Zadano ▾" isActive={false} onPress={() => {}} />
      </View>

      {/* 3-Column Paginated Poster Grid */}
      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item, idx) => item.id || `exp-${idx}`}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <MovieCard movie={item} onPress={(m) => navigation.navigate('Detail', { movie: m })} />
          </View>
        )}
        contentContainerStyle={styles.gridContent}
        onEndReached={() => loadBatch(false)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#6C5CE7" style={{ marginVertical: 20 }} /> : null}
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
  filterDropdownFocused: {
    backgroundColor: '#6C5CE7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.08 }],
    elevation: 8,
    shadowColor: '#6C5CE7',
    shadowRadius: 8
  },
  filterText: {
    color: '#E2E8F0',
    fontSize: isTV ? 15 : 13,
    fontWeight: '600'
  },
  filterTextFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
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
