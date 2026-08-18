import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { firebaseService } from '../services/firebase';
import MovieCard from '../components/MovieCard';
import { isTV } from '../utils/device';
import { watchHistoryManager } from '../services/watchHistoryManager';

function ContinueWatchingCard({ item, onPress }) {
  const [isFocused, setIsFocused] = useState(false);
  const displayTitle = item.title || item.titleBosnian || item.titleEnglish || item.rawTitle || 'Crtani Film';
  const displayPoster = item.poster || item.backdrop || 'https://image.tmdb.org/t/p/w342/8o6lkhL32xQJeB52IIG1us5BVey.jpg';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={() => onPress(item)}
      style={[
        styles.historyCard,
        isFocused && styles.historyCardFocused
      ]}
    >
      <Image source={{ uri: displayPoster }} style={styles.historyPoster} />
      
      <View style={styles.checkmarkBadge}>
        <Text style={styles.checkmarkText}>✓</Text>
      </View>

      <View style={styles.historyOverlay}>
        <Text style={[styles.historyTitle, isFocused && styles.historyTitleFocused]} numberOfLines={1}>
          {displayTitle}
        </Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${(item.progress || 0.5) * 100}%` }]} />
      </View>

      {isFocused && <View style={styles.focusBorder} />}
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState({ featured: [], popularMovies: [], cartoonSeries: [], exYuClassics: [], dubbedCartoons: [], all: [] });
  const [watchHistory, setWatchHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const result = await firebaseService.getHomePageCategories();
    if (result) {
      setData(result);
    }
  };

  useEffect(() => {
    loadData();
    // Subscribe to real-time watch history updates
    const unsubscribe = watchHistoryManager.subscribe((list) => {
      setWatchHistory(list);
    });
    return () => unsubscribe();
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
            placeholder="Možete pretražiti bilo koji crtani film ili seriju..."
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
              <ContinueWatchingCard
                item={item}
                onPress={handleMoviePress}
              />
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
          data={moviesOnly.length > 0 ? moviesOnly : data.all}
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
          data={seriesOnly.length > 0 ? seriesOnly : data.all}
          keyExtractor={(item, idx) => item?.id ? `ser-${item.id}-${idx}` : `ser-${idx}`}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* GledajCrtace & Dodatna Kolekcija */}
      {gledajCrtaceOnly.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 Najnovije Dodano</Text>
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
    paddingBottom: 40
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#090A10'
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121420',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: isTV ? 52 : 44,
    borderWidth: 1,
    borderColor: '#1E2235'
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: isTV ? 16 : 14,
    paddingVertical: 0
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 8
  },
  section: {
    marginTop: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: isTV ? 20 : 16,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  vidiSve: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8
  },
  historyCard: {
    width: isTV ? 160 : 120,
    marginRight: 14,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#161823',
    position: 'relative'
  },
  historyCardFocused: {
    transform: [{ scale: 1.10 }],
    elevation: 16,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    zIndex: 999
  },
  historyPoster: {
    width: '100%',
    height: isTV ? 220 : 165,
    borderRadius: 12
  },
  historyOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(9, 10, 16, 0.8)'
  },
  historyTitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600'
  },
  historyTitleFocused: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6C5CE7'
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: '#6C5CE7',
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.2)'
  }
});
