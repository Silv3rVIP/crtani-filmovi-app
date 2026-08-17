import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { isTV, getLayoutMetrics } from '../utils/device';

const { heroHeight } = getLayoutMetrics();

export default function HeroBanner({ movie, onPlayPress }) {
  const [isFocused, setIsFocused] = useState(false);

  if (!movie) return null;

  return (
    <View style={styles.bannerContainer}>
      <ImageBackground
        source={{ uri: movie.backdrop || movie.poster }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.gradientOverlay}>
          <View style={styles.content}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ISTAKNUTO • SINHRONIZOVANO</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {movie.title}
            </Text>
            {movie.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {movie.description}
              </Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onPlayPress(movie)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={[
                styles.playButton,
                isFocused && styles.playButtonFocused
              ]}
            >
              <Text style={[styles.playButtonText, isFocused && styles.playButtonTextFocused]}>
                ▶ Gledaj Film
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: heroHeight,
    backgroundColor: '#0F0F1A',
    marginBottom: isTV ? 28 : 16
  },
  backgroundImage: {
    width: '100%',
    height: '100%'
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 26, 0.65)',
    justifyContent: 'flex-end',
    padding: isTV ? 40 : 20
  },
  content: {
    maxWidth: isTV ? 700 : '100%'
  },
  badge: {
    backgroundColor: '#FF2A6D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: isTV ? 12 : 10,
    fontWeight: '700',
    letterSpacing: 1
  },
  title: {
    color: '#FFFFFF',
    fontSize: isTV ? 36 : 22,
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6
  },
  description: {
    color: '#CBD5E1',
    fontSize: isTV ? 16 : 12,
    lineHeight: isTV ? 22 : 16,
    marginBottom: 16
  },
  playButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: isTV ? 28 : 18,
    paddingVertical: isTV ? 14 : 10,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  playButtonFocused: {
    backgroundColor: '#FF2A6D',
    transform: [{ scale: 1.05 }],
    elevation: 8
  },
  playButtonText: {
    color: '#0F0F1A',
    fontSize: isTV ? 18 : 14,
    fontWeight: '700'
  },
  playButtonTextFocused: {
    color: '#FFFFFF'
  }
});
