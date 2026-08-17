import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview'; // Fallback / embed support
import { isTV } from '../utils/device';

export default function VideoPlayer({ embedUrl, title, onClose }) {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Convert embedUrl to standard HTML5 iframe player
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #000; overflow: hidden; }
          iframe, video { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="${embedUrl}" 
          allowfullscreen="true" 
          allow="autoplay; encrypted-media; picture-in-picture"
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hasTVPreferredFocus={true}
        >
          <Text style={styles.closeButtonText}>✕ Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Webview or Native Video Player */}
      <View style={styles.playerWrapper}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00E5FF" />
            <Text style={styles.loadingText}>Učitavanje videa...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    height: isTV ? 60 : 50,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10
  },
  closeButton: {
    backgroundColor: '#FF2A6D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 16
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: isTV ? 16 : 14
  },
  title: {
    color: '#E2E8F0',
    fontSize: isTV ? 20 : 16,
    fontWeight: '600',
    flex: 1
  },
  playerWrapper: {
    flex: 1,
    position: 'relative'
  },
  webview: {
    flex: 1,
    backgroundColor: '#000'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A12',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: isTV ? 16 : 14
  }
});
