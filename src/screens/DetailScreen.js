import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchMovieDetails } from '../api/scraper';
import { isTV } from '../utils/device';

export default function DetailScreen({ route, navigation }) {
  const { movie } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlayFocused, setIsPlayFocused] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      const res = await fetchMovieDetails(movie.url || `https://crtanifilmovielena.com/movie/${movie.id}/`);
      setDetails(res);
      setLoading(false);
    }
    loadDetails();
  }, [movie]);

  const handlePlay = () => {
    navigation.navigate('Player', {
      embedUrl: details?.embedUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: movie.title
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground
        source={{ uri: movie.backdrop || movie.poster }}
        style={styles.backdrop}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Nazad</Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <View style={styles.badgeRow}>
              <Text style={styles.tag}>HD</Text>
              <Text style={styles.tag}>SRPSKI SINHRONIZOVANO</Text>
            </View>

            <Text style={styles.title}>{movie.title}</Text>

            {loading ? (
              <ActivityIndicator size="small" color="#00E5FF" style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
            ) : (
              <Text style={styles.description}>
                {details?.description || movie.description || 'Nema opisa za ovaj film.'}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePlay}
              onFocus={() => setIsPlayFocused(true)}
              onBlur={() => setIsPlayFocused(false)}
              hasTVPreferredFocus={true}
              style={[
                styles.playBtn,
                isPlayFocused && styles.playBtnFocused
              ]}
            >
              <Text style={[styles.playBtnText, isPlayFocused && styles.playBtnTextFocused]}>
                ▶ GLEDAJ FILM ODMAH
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12'
  },
  backdrop: {
    width: '100%',
    minHeight: '100%',
    flex: 1
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 18, 0.85)',
    padding: isTV ? 40 : 20,
    justifyContent: 'space-between'
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: isTV ? 16 : 14
  },
  infoContainer: {
    maxWidth: isTV ? 850 : '100%',
    marginTop: 40
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  tag: {
    backgroundColor: '#00E5FF',
    color: '#0F0F1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: isTV ? 12 : 10,
    fontWeight: '700'
  },
  title: {
    color: '#FFFFFF',
    fontSize: isTV ? 42 : 26,
    fontWeight: '800',
    marginBottom: 16
  },
  description: {
    color: '#CBD5E1',
    fontSize: isTV ? 18 : 14,
    lineHeight: isTV ? 26 : 20,
    marginBottom: 24
  },
  playBtn: {
    backgroundColor: '#FF2A6D',
    paddingHorizontal: isTV ? 32 : 24,
    paddingVertical: isTV ? 16 : 12,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  playBtnFocused: {
    backgroundColor: '#00E5FF',
    transform: [{ scale: 1.05 }],
    elevation: 8
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: isTV ? 20 : 15,
    fontWeight: '800'
  },
  playBtnTextFocused: {
    color: '#0F0F1A'
  }
});
