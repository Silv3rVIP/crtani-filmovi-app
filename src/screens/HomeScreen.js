import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { fetchHomePageData } from '../api/scraper';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import { isTV, getLayoutMetrics } from '../utils/device';
import { watchHistoryManager } from '../services/watchHistoryManager';

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState({ featured: [], movies: [], categories: [] });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const result = await fetchHomePageData();
    if (result && (result.movies.length > 0 || result.featured.length > 0)) {
      setData(result);
    }
    const history = watchHistoryManager.getHistory();
    setWatchHistory(history);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setWatchHistory(watchHistoryManager.getHistory());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleMoviePress = (movie) => {
    navigation.navigate('Detail', { movie });
  };

  const categoriesList = [
    { id: 'all', name: '⚡ Sve' },
    { id: 'gledajcrtace', name: '🎬 GledajCrtace.net' },
    { id: 'popular', name: '🔥 Popularno' },
    { id: 'disney', name: '🏰 Disney & Pixar' },
    { id: 'classic', name: '⭐ Klasični' },
    { id: 'series', name: '📺 Crtane Serije' }
  ];

  const featuredMovie = data.featured[0] || data.movies[0];

  const filteredMovies = selectedCategory === 'all'
    ? data.movies
    : data.movies.filter((m) => m.tags && m.tags.includes(selectedCategory));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#7B2CBF" />
      }
    >
      {/* Featured Hero Banner */}
      {featuredMovie && <HeroBanner movie={featuredMovie} onPlayPress={handleMoviePress} />}

      {/* Continue Watching Row (Stremio Feature) */}
      {watchHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>▶ Nastavi Gledanje</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={watchHistory}
            keyExtractor={(item, idx) => item.id || `hist-${idx}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleMoviePress(item)}
                style={styles.historyCard}
              >
                <Image source={{ uri: item.poster || item.backdrop }} style={styles.historyPoster} />
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${(item.progress || 0.5) * 100}%` }]} />
                </View>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Stremio Category Selector Bar */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Recommended Movies Row */}
      {data.featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Istaknuto & Sinhronizovano</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data.featured}
            keyExtractor={(item, idx) => item.id || `feat-${idx}`}
            renderItem={({ item, index }) => (
              <MovieCard movie={item} onPress={handleMoviePress} hasPreferredFocus={index === 0 && isTV} />
            )}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Catalog Grid / Row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Kataloški Crtani Filmovi</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredMovies.length > 0 ? filteredMovies : data.movies}
          keyExtractor={(item, idx) => item.id || `mov-${idx}`}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080E'
  },
  scrollContent: {
    paddingBottom: 40
  },
  categoryContainer: {
    marginVertical: isTV ? 20 : 12,
    paddingLeft: isTV ? 32 : 16
  },
  categoryList: {
    paddingRight: 32,
    gap: 10
  },
  categoryPill: {
    backgroundColor: '#131525',
    paddingHorizontal: isTV ? 20 : 14,
    paddingVertical: isTV ? 10 : 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242842'
  },
  categoryPillActive: {
    backgroundColor: '#7B2CBF',
    borderColor: '#9D4EDD'
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: isTV ? 16 : 13,
    fontWeight: '600'
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  section: {
    marginBottom: isTV ? 32 : 20,
    paddingLeft: isTV ? 32 : 16
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: isTV ? 22 : 16,
    fontWeight: '800',
    marginBottom: isTV ? 16 : 10,
    letterSpacing: 0.5
  },
  horizontalList: {
    paddingRight: 32
  },
  historyCard: {
    width: isTV ? 220 : 160,
    marginRight: isTV ? 20 : 14,
    borderRadius: 10,
    backgroundColor: '#111322',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#242842'
  },
  historyPoster: {
    width: '100%',
    height: isTV ? 120 : 90,
    resizeMode: 'cover'
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#1E2238',
    width: '100%'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7B2CBF'
  },
  historyTitle: {
    color: '#E2E8F0',
    fontSize: isTV ? 14 : 12,
    fontWeight: '600',
    padding: 8
  }
});
