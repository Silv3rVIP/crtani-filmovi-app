import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchMovieDetails } from '../api/scraper';
import { isTV } from '../utils/device';
import { watchHistoryManager } from '../services/watchHistoryManager';
import { cacheManager } from '../services/cacheManager';

function ServerPill({ server, isActive, onPress }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[
        styles.addonPill,
        isActive && styles.addonPillActive,
        isFocused && styles.addonPillFocused
      ]}
    >
      <Text style={[styles.addonText, isActive && styles.addonTextActive, isFocused && styles.addonTextFocused]}>
        {server.serverName}
      </Text>
    </TouchableOpacity>
  );
}

function EpisodePill({ episode, isSelected, onPress }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[
        styles.addonPill,
        isSelected && styles.addonPillActive,
        isFocused && styles.addonPillFocused
      ]}
    >
      <Text style={[styles.addonText, isSelected && styles.addonTextActive, isFocused && styles.addonTextFocused]}>
        ▶ {episode.title || `Epizoda ${episode.episode}`}
      </Text>
    </TouchableOpacity>
  );
}

function FocusablePlayBtn({ label = '▶ GLEDAJ FILM ODMAH', onPress }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[styles.playBtn, isFocused && styles.playBtnFocused]}
    >
      <Text style={[styles.playBtnText, isFocused && styles.playBtnTextFocused]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DetailScreen({ route, navigation }) {
  const movie = route?.params?.movie || {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [activeAddon, setActiveAddon] = useState('All');
  const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (!movie.url && !movie.id) return;

      const cacheKey = `details_${movie.id || movie.url}`;
      const cached = await cacheManager.get(cacheKey);
      if (cached && isMounted) {
        setDetails(cached);
        setLoading(false);
      } else if (isMounted) {
        setLoading(true);
      }

      try {
        const res = await fetchMovieDetails(movie.url || `https://crtanifilmovielena.com/movie/${movie.id}/`);
        if (res && isMounted) {
          setDetails(res);
          cacheManager.set(cacheKey, res);
        }
      } catch (err) {
        console.warn('Detail fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [movie]);

  const handlePlay = () => {
    watchHistoryManager.saveProgress(movie);
    const streamUrl = details?.embedUrl || movie?.url || (movie?.id ? `https://crtanifilmovielena.com/movie/${movie.id}/` : 'https://crtanifilmovielena.com');

    navigation.navigate('Player', {
      embedUrl: streamUrl,
      title: movie?.title || 'Sinhronizovani Crtani Film'
    });
  };

  const backdropUri = movie?.backdrop || movie?.poster || 'https://image.tmdb.org/t/p/w1280/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Backdrop Header */}
        <ImageBackground source={{ uri: backdropUri }} style={styles.backdrop} resizeMode="cover">
          <View style={styles.gradientOverlay}>
            {/* Top Navigation & Action Icons Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => navigation?.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.circleBtnText}>‹</Text>
              </TouchableOpacity>

              <View style={styles.topRightActions}>
                <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}>
                  <Text style={styles.circleBtnText}>🔗</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}>
                  <Text style={styles.circleBtnText}>🎬</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.circleBtn, inLibrary && styles.circleBtnActive]}
                  onPress={() => setInLibrary(!inLibrary)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.circleBtnText}>{inLibrary ? '✓' : '➕'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>{movie.title}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>95 min • 2024 • </Text>
            <View style={styles.imdbBadge}>
              <Text style={styles.imdbText}>IMDb 8.2</Text>
            </View>
            <View style={styles.metaRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setLiked(!liked)}>
                <Text style={styles.iconText}>{liked ? '👍' : '👍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setInLibrary(!inLibrary)}>
                <Text style={styles.iconText}>{inLibrary ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Synopsis */}
          {loading ? (
            <ActivityIndicator size="small" color="#6C5CE7" style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
          ) : (
            <Text style={styles.description}>
              {details?.description || movie.description || 'Popularni sinhronizovani crtani film dostupan sa srpskom i hrvatskom sinhronizacijom.'}
            </Text>
          )}

          {/* Genre Pills */}
          <View style={styles.pillRow}>
            <View style={styles.pill}><Text style={styles.pillText}>Animacija</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Porodični</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Komedija</Text></View>
          </View>

          {/* REDATELJ */}
          <View style={styles.creditSection}>
            <Text style={styles.creditLabel}>REDATELJ</Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}><Text style={styles.pillText}>Walt Disney Animation</Text></View>
            </View>
          </View>

          {/* GLUMCI */}
          <View style={styles.creditSection}>
            <Text style={styles.creditLabel}>GLUMCI</Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}><Text style={styles.pillText}>Marko Marković</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>Jelena Gavrilović</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>Dragan Mićanović</Text></View>
            </View>
          </View>

          {/* SCENARIST */}
          <View style={styles.creditSection}>
            <Text style={styles.creditLabel}>SCENARIST</Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}><Text style={styles.pillText}>Originalni Scenaristi</Text></View>
            </View>
          </View>

          {/* TV Series Seasons & Episodes Section */}
          {(movie?.episodes?.length > 0 || details?.episodes?.length > 0) && (
            <View style={styles.streamSection}>
              <Text style={styles.creditLabel}>EPIZODE I SEZONE ({movie?.episodes?.length || details?.episodes?.length} Epizoda)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addonList}>
                {(movie?.episodes || details?.episodes || []).map((ep, idx) => (
                  <EpisodePill
                    key={idx}
                    episode={ep}
                    isSelected={selectedEpisodeIdx === idx}
                    onPress={() => setSelectedEpisodeIdx(idx)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Stream Addons & Multi-Server Sources Section */}
          <View style={styles.streamSection}>
            <Text style={styles.creditLabel}>IZVORI I SERVERI ZA GLEDANJE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addonList}>
              {(movie?.servers || details?.servers || [
                { serverName: 'Server 1 (HD)', embedUrl: details?.embedUrl || movie?.url },
                { serverName: 'Server 2 (Backup)', embedUrl: details?.embedUrl || movie?.url }
              ]).map((server, idx) => {
                const isActive = activeAddon === idx || (activeAddon === 'All' && idx === 0);
                return (
                  <ServerPill
                    key={idx}
                    server={server}
                    idx={idx}
                    isActive={isActive}
                    onPress={() => setActiveAddon(idx)}
                  />
                );
              })}
            </ScrollView>

            <FocusablePlayBtn
              label={movie?.episodes?.length > 0 ? `▶ GLEDAJ EPIZODU ${selectedEpisodeIdx + 1}` : '▶ GLEDAJ FILM ODMAH'}
              onPress={() => {
                const epList = movie?.episodes || details?.episodes || [];
                const serverList = movie?.servers || details?.servers || [];
                const selectedIdx = typeof activeAddon === 'number' ? activeAddon : 0;
                const selectedServer = serverList[selectedIdx] || serverList[0];
                
                const targetUrl = epList.length > 0 
                  ? epList[selectedEpisodeIdx]?.embedUrl || selectedServer?.embedUrl
                  : selectedServer?.embedUrl || details?.embedUrl || movie?.url || 'https://crtanifilmovielena.com';
                
                watchHistoryManager.saveProgress(movie);
                navigation.navigate('Player', {
                  embedUrl: targetUrl,
                  title: epList.length > 0 ? `${movie?.title || 'Serija'} - Epizoda ${selectedEpisodeIdx + 1}` : (movie?.title || 'Sinhronizovani Crtani Film')
                });
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
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
  backdrop: {
    width: '100%',
    height: isTV ? 380 : 280
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 10, 16, 0.55)',
    justifyContent: 'space-between',
    padding: 16
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 10
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(22, 24, 35, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  circleBtnActive: {
    backgroundColor: '#6C5CE7'
  },
  circleBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  titleWrapper: {
    marginBottom: 10
  },
  title: {
    color: '#FFFFFF',
    fontSize: isTV ? 32 : 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  body: {
    padding: 16
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  metaText: {
    color: '#94A3B8',
    fontSize: isTV ? 15 : 13,
    fontWeight: '600'
  },
  imdbBadge: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  imdbText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 11
  },
  metaRight: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 'auto'
  },
  iconBtn: {
    padding: 4
  },
  iconText: {
    fontSize: 18
  },
  description: {
    color: '#CBD5E1',
    fontSize: isTV ? 16 : 14,
    lineHeight: 22,
    marginBottom: 16
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  pill: {
    backgroundColor: '#161823',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242736'
  },
  pillText: {
    color: '#E2E8F0',
    fontSize: isTV ? 14 : 12,
    fontWeight: '500'
  },
  creditSection: {
    marginBottom: 12
  },
  creditLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  streamSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E2230'
  },
  addonList: {
    gap: 10,
    marginBottom: 16
  },
  addonPill: {
    backgroundColor: '#161823',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242736'
  },
  addonPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6'
  },
  addonPillFocused: {
    backgroundColor: '#6C5CE7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.10 }],
    elevation: 10,
    shadowColor: '#6C5CE7',
    shadowRadius: 10
  },
  addonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600'
  },
  addonTextActive: {
    color: '#FFFFFF'
  },
  addonTextFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  playBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4
  },
  playBtnFocused: {
    backgroundColor: '#5B4BC4',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
    elevation: 14,
    shadowColor: '#6C5CE7',
    shadowRadius: 14
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: isTV ? 16 : 14,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  playBtnTextFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
  }
});
