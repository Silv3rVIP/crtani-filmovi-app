import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { fetchHomePageData } from '../api/scraper';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import { isTV, getLayoutMetrics } from '../utils/device';

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState({ featured: [], movies: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchHomePageData();
    setData(result);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoviePress = (movie) => {
    navigation.navigate('Detail', { movie });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Učitavanje crtanih filmova...</Text>
      </View>
    );
  }

  const featuredMovie = data.featured[0] || data.movies[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#00E5FF" />
      }
    >
      {/* Featured Hero Banner */}
      <HeroBanner movie={featuredMovie} onPlayPress={handleMoviePress} />

      {/* Recommended Movies Row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Najpopularniji Filmovi</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data.featured}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MovieCard movie={item} onPress={handleMoviePress} hasPreferredFocus={index === 0 && isTV} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Latest Uploads Row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Najnovije Dodato</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data.movies}
          keyExtractor={(item) => item.id}
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
    backgroundColor: '#0A0A12'
  },
  scrollContent: {
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A12',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: isTV ? 18 : 14
  },
  section: {
    marginBottom: isTV ? 32 : 20,
    paddingLeft: isTV ? 32 : 16
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: isTV ? 22 : 16,
    fontWeight: '700',
    marginBottom: isTV ? 16 : 10
  },
  horizontalList: {
    paddingRight: 32
  }
});
