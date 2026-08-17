import React, { useState } from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import { isTV, getLayoutMetrics } from '../utils/device';

const { cardWidth, cardHeight } = getLayoutMetrics();

export default function MovieCard({ movie, onPress, hasPreferredFocus = false }) {
  const [isFocused, setIsFocused] = useState(false);

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
        source={{ uri: movie.poster }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.gradientOverlay}>
        <Text style={[styles.title, isFocused && styles.titleFocused]} numberOfLines={2}>
          {movie.title}
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
    transform: [{ scale: isTV ? 1.08 : 1.02 }],
    elevation: 10,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10
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
    color: '#00E5FF',
    fontWeight: '700'
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: isTV ? 4 : 2,
    borderColor: '#00E5FF',
    borderRadius: 12
  }
});
