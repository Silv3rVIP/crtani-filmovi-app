import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { firebaseService } from '../services/firebase';
import MovieCard from '../components/MovieCard';
import { isTV } from '../utils/device';
import { watchHistoryManager } from '../services/watchHistoryManager';

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState({ featured: [], popularMovies: [], cartoonSeries: [], exYuClassics: [], dubbedCartoons: [], all: [] });
  const [watchHistory, setWatchHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const result = await firebaseService.getHomePageCategories();
    if (result) {
      setData(result);
    }
    const history = watchHistoryManager.getHistory();
    setWatchHistory(history);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setWatchHistory(watchHistoryManager.getHistory());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMoviePress = (movie) => {
    navigation.navigate('Detail', { movie });
  };

  const moviesOnly = data.popularMovies.length > 0 ? data.popularMovies : data.all;
  const seriesOnly = data.cartoonSeries.length > 0 ? data.cartoonSeries : data.all;
  const exYuOnly = data.exYuClassics.length > 0 ? data.exYuClassics : data.all;
  const gledajCrtaceOnly = data.dubbedCartoons.length > 0 ? data.dubbedCartoons : data.all;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Search Input Bar (Stremio Header) */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Možete pretražiti bilo što..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => navigation.navigate('Search', { query: searchQuery })}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Search', { query: searchQuery })}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nastavi gledati (Continue Watching Row) */}
      {watchHistory.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nastavi gledati</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Library')}>
              <Text style={styles.vidiSve}>VIDI SVE ›</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={watchHistory}
            keyExtractor={(item, idx) => item?.id ? `hist-${item.id}-${idx}` : `hist-${idx}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleMoviePress(item)}
                style={styles.historyCard}
              >
                <Image source={{ uri: item.poster || item.backdrop }} style={styles.historyPoster} />
                <View style={styles.checkmarkBadge}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${(item.progress || 0.5) * 100}%` }]} />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Popularno - Film (Popular Movies Row) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popularno – Film</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.vidiSve}>VIDI SVE ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={moviesOnly.length > 0 ? moviesOnly : data.movies}
          keyExtractor={(item, idx) => item?.id ? `mov-${item.id}-${idx}` : `mov-${idx}`}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Popularno - Serija (Popular Series Row) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popularno – Serija</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.vidiSve}>VIDI SVE ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={seriesOnly.length > 0 ? seriesOnly : data.movies}
          keyExtractor={(item, idx) => item?.id ? `ser-${item.id}-${idx}` : `ser-${idx}`}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* GledajCrtace.net Kolekcija */}
      {gledajCrtaceOnly.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 GledajCrtace.net Kolekcija</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.vidiSve}>VIDI SVE ›</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={gledajCrtaceOnly}
            keyExtractor={(item, idx) => item?.id ? `gled-${item.id}-${idx}` : `gled-${idx}`}
            renderItem={({ item }) => (
              <MovieCard movie={item} onPress={handleMoviePress} />
            )}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A10'
  },
  scrollContent: {
    paddingBottom: 80
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D0E15'
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161823',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#242736'
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 8
  },
  section: {
    marginVertical: 14
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: isTV ? 20 : 16,
    fontWeight: '700'
  },
  vidiSve: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8
  },
  historyCard: {
    width: isTV ? 160 : 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#161823',
    position: 'relative'
  },
  historyPoster: {
    width: '100%',
    height: isTV ? 220 : 165,
    borderRadius: 12
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6'
  }
});
