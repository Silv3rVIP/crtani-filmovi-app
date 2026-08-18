import React, { useState } from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import { isTV, getLayoutMetrics } from '../utils/device';

const { cardWidth, cardHeight } = getLayoutMetrics();

export default function MovieCard({ movie, onPress, hasPreferredFocus = false }) {
  const [isFocused, setIsFocused] = useState(false);

  const displayTitle = movie?.title || movie?.titleBosnian || movie?.titleEnglish || movie?.rawTitle || 'Crtani Film';
  const displayPoster = movie?.poster || movie?.backdrop || 'https://image.tmdb.org/t/p/w342/8o6lkhL32xQJeB52IIG1us5BVey.jpg';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(movie)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      hasTVPreferredFocus={hasPreferredFocus}
      style={[
        styles.card,
        isFocused && styles.cardFocused
      ]}
    >
      <Image
        source={{ uri: displayPoster }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.gradientOverlay}>
        <Text style={[styles.title, isFocused && styles.titleFocused]} numberOfLines={2}>
          {displayTitle}
        </Text>
      </View>

      {/* Android TV D-Pad Focus Ring */}
      {isFocused && <View style={styles.focusBorder} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 12,
    marginRight: isTV ? 20 : 12,
    backgroundColor: '#1E1E2C',
    overflow: 'hidden',
    position: 'relative',
    transform: [{ scale: 1 }]
  },
  cardFocused: {
    transform: [{ scale: 1.10 }],
    elevation: 16,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    zIndex: 999
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: isTV ? 12 : 8,
    backgroundColor: 'rgba(10, 10, 18, 0.85)'
  },
  title: {
    color: '#E2E8F0',
    fontSize: isTV ? 15 : 12,
    fontWeight: '600'
  },
  titleFocused: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: '#6C5CE7',
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.2)'
  }
});
