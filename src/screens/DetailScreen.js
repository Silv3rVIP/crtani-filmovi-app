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
        styles.episodePill,
        isSelected && styles.episodePillActive,
        isFocused && styles.episodePillFocused
      ]}
    >
      <Text style={[styles.episodeText, isSelected && styles.episodeTextActive, isFocused && styles.episodeTextFocused]}>
        {isSelected ? '▶ ' : ''}{episode.title || `Epizoda ${episode.episode || 1}`}
      </Text>
    </TouchableOpacity>
  );
}

function FocusablePlayBtn({ label = '▶ PUSTI FILM ODMAH', onPress }) {
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
  const [inLibrary, setInLibrary] = useState(false);
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState(0);

  // Dynamic movie information
  const displayTitle = movie?.title || movie?.titleBosnian || movie?.titleEnglish || movie?.rawTitle || 'Crtani Film';
  const displayYear = movie?.year || (movie?.releaseDate ? movie.releaseDate.split('-')[0] : 2024);
  const displayRating = movie?.imdbRating || movie?.rating || (details?.rating ? parseFloat(details.rating) : 7.8);
  const isSeries = movie?.type === 'serija' || (Array.isArray(movie?.episodes) && movie.episodes.length > 0);
  const episodesList = Array.isArray(movie?.episodes) && movie.episodes.length > 0 ? movie.episodes : (details?.episodes || []);
  
  const displayDuration = isSeries
    ? `${episodesList.length > 0 ? episodesList.length : 1} Epizoda`
    : (movie?.type === 'kratki_crtani' ? '10 min' : (movie?.duration || '85 min'));

  const dubbingLabel = movie?.dubbingType === 'titlovano' ? '📝 Titlovano' : '🎙️ Sinhronizovano';
  const typeLabel = isSeries ? '📺 Serija' : (movie?.type === 'kratki_crtani' ? '🎬 Kratki Crtani' : '🎬 Dugometražni');
  const genres = Array.isArray(movie?.genres) && movie.genres.length > 0 ? movie.genres : ['Animacija', 'Porodični'];

  const serversList = Array.isArray(movie?.servers) && movie.servers.length > 0
    ? movie.servers
    : (Array.isArray(details?.servers) && details.servers.length > 0
      ? details.servers
      : [
          { serverName: 'Server 1 (Glavni HD)', embedUrl: movie?.streamUrl || movie?.sourceUrl || details?.embedUrl || movie?.url },
          { serverName: 'Server 2 (Rezervni)', embedUrl: movie?.streamUrl || movie?.sourceUrl || details?.embedUrl || movie?.url }
        ]);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (!movie.url && !movie.id && !movie.sourceUrl) return;

      const cacheKey = `details_${movie.id || movie.url || movie.sourceUrl}`;
      const cached = await cacheManager.get(cacheKey);
      if (cached && isMounted) {
        setDetails(cached);
        setLoading(false);
      } else if (isMounted) {
        setLoading(true);
      }

      try {
        const targetUrl = movie.url || movie.sourceUrl || (movie.id ? `https://crtanifilmovielena.com/movie/${movie.id}/` : null);
        if (targetUrl) {
          const res = await fetchMovieDetails(targetUrl);
          if (res && isMounted) {
            setDetails(res);
            cacheManager.set(cacheKey, res);
          }
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

  const handlePlayCurrent = () => {
    watchHistoryManager.saveProgress(movie);
    
    let streamUrl = '';
    let streamTitle = displayTitle;

    if (isSeries && episodesList.length > 0) {
      const ep = episodesList[selectedEpisodeIdx] || episodesList[0];
      streamUrl = ep?.embedUrl || serversList[activeServerIdx]?.embedUrl || movie?.streamUrl;
      streamTitle = `${displayTitle} - ${ep?.title || `Epizoda ${selectedEpisodeIdx + 1}`}`;
    } else {
      const selectedServer = serversList[activeServerIdx] || serversList[0];
      streamUrl = selectedServer?.embedUrl || movie?.streamUrl || movie?.sourceUrl || details?.embedUrl || 'https://crtanifilmovielena.com';
    }

    navigation.navigate('Player', {
      embedUrl: streamUrl,
      title: streamTitle
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
                <TouchableOpacity
                  style={[styles.circleBtn, inLibrary && styles.circleBtnActive]}
                  onPress={() => setInLibrary(!inLibrary)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.circleBtnText}>{inLibrary ? '✓' : '➕'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Prominent Title in Hero Banner */}
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>{displayTitle}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Real Metadata Row: Godina • Trajanje • IMDb Ocjena • Tip */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{displayYear} • {displayDuration} • </Text>
            <View style={styles.imdbBadge}>
              <Text style={styles.imdbText}>IMDb {displayRating}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{dubbingLabel}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{typeLabel}</Text>
            </View>
          </View>

          {/* Genre Badges */}
          <View style={styles.pillRow}>
            {genres.map((g, idx) => (
              <View key={idx} style={styles.pill}>
                <Text style={styles.pillText}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Short Synopsis / Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeaderLabel}>KRATAK OPIS</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#6C5CE7" style={{ alignSelf: 'flex-start', marginVertical: 8 }} />
            ) : (
              <Text style={styles.description}>
                {movie?.description || details?.description || `${displayTitle} – gledajte besplatno u HD rezoluciji sa prevodom ili sinhronizacijom.`}
              </Text>
            )}
          </View>

          {/* TV Series Seasons & Episodes Section */}
          {isSeries && episodesList.length > 0 && (
            <View style={styles.streamSection}>
              <Text style={styles.sectionHeaderLabel}>EPIZODE I SEZONE ({episodesList.length} Epizoda)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addonList}>
                {episodesList.map((ep, idx) => (
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

          {/* Stream Servers & Source Options */}
          <View style={styles.streamSection}>
            <Text style={styles.sectionHeaderLabel}>IZVORI I SERVERI ZA GLEDANJE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addonList}>
              {serversList.map((server, idx) => {
                const isActive = activeServerIdx === idx;
                return (
                  <ServerPill
                    key={idx}
                    server={server}
                    isActive={isActive}
                    onPress={() => setActiveServerIdx(idx)}
                  />
                );
              })}
            </ScrollView>

            {/* Primary Action Button */}
            <FocusablePlayBtn
              label={isSeries && episodesList.length > 0 ? `▶ PUSTI EPIZODU ${selectedEpisodeIdx + 1}` : '▶ PUSTI FILM ODMAH'}
              onPress={handlePlayCurrent}
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
    backgroundColor: 'rgba(9, 10, 16, 0.65)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(22, 24, 35, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  circleBtnActive: {
    backgroundColor: '#6C5CE7'
  },
  circleBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  titleWrapper: {
    marginBottom: 8
  },
  title: {
    color: '#FFFFFF',
    fontSize: isTV ? 32 : 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6
  },
  body: {
    padding: 16
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  metaText: {
    color: '#94A3B8',
    fontSize: isTV ? 15 : 13,
    fontWeight: '600'
  },
  imdbBadge: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  imdbText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 11
  },
  typeBadge: {
    backgroundColor: '#1E1E2C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D3047'
  },
  typeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700'
  },
  descSection: {
    marginBottom: 16
  },
  sectionHeaderLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  description: {
    color: '#CBD5E1',
    fontSize: isTV ? 16 : 14,
    lineHeight: 22
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  pill: {
    backgroundColor: '#161823',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242736'
  },
  pillText: {
    color: '#94A3B8',
    fontSize: isTV ? 13 : 11,
    fontWeight: '600'
  },
  streamSection: {
    marginTop: 8,
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
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242736'
  },
  addonPillActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6C5CE7'
  },
  addonPillFocused: {
    backgroundColor: '#6C5CE7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.08 }],
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
    color: '#A29BFE',
    fontWeight: '800'
  },
  addonTextFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  episodePill: {
    backgroundColor: '#161823',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242736',
    minWidth: 120,
    alignItems: 'center'
  },
  episodePillActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6C5CE7'
  },
  episodePillFocused: {
    backgroundColor: '#6C5CE7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.08 }],
    elevation: 10,
    shadowColor: '#6C5CE7',
    shadowRadius: 10
  },
  episodeText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600'
  },
  episodeTextActive: {
    color: '#A29BFE',
    fontWeight: '800'
  },
  episodeTextFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  playBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6
  },
  playBtnFocused: {
    backgroundColor: '#5B4BC4',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.04 }],
    elevation: 14,
    shadowColor: '#6C5CE7',
    shadowRadius: 14
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: isTV ? 16 : 14,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  playBtnTextFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
  }
});
