import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { isTV } from './src/utils/device';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screenName, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    if (currentScreen === 'Player') {
      setCurrentScreen('Detail');
    } else if (currentScreen === 'Detail' || currentScreen === 'Search') {
      setCurrentScreen('Home');
    }
  };

  useEffect(() => {
    const handleBackPress = () => {
      if (currentScreen !== 'Home') {
        goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [currentScreen]);

  const navigationObj = {
    navigate,
    goBack
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A12" />

        {/* Top Navbar */}
        {currentScreen !== 'Player' && (
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigate('Home')} activeOpacity={0.7}>
              <Text style={styles.brand}>
                <Text style={{ color: '#00E5FF' }}>Crtani</Text> Elena TV
              </Text>
            </TouchableOpacity>

            <View style={styles.navActions}>
              <TouchableOpacity
                onPress={() => navigate('Home')}
                style={[styles.navBtn, currentScreen === 'Home' && styles.navBtnActive]}
              >
                <Text style={styles.navBtnText}>Početna</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigate('Search')}
                style={[styles.navBtn, currentScreen === 'Search' && styles.navBtnActive]}
              >
                <Text style={styles.navBtnText}>🔍 Pretraga</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Screen Router */}
        <View style={styles.screenContainer}>
          {currentScreen === 'Home' && <HomeScreen navigation={navigationObj} />}
          {currentScreen === 'Detail' && <DetailScreen route={{ params: screenParams }} navigation={navigationObj} />}
          {currentScreen === 'Search' && <SearchScreen navigation={navigationObj} />}
          {currentScreen === 'Player' && <PlayerScreen route={{ params: screenParams }} navigation={navigationObj} />}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12'
  },
  navbar: {
    height: isTV ? 64 : 54,
    backgroundColor: '#0F0F1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTV ? 32 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2C'
  },
  brand: {
    color: '#FFFFFF',
    fontSize: isTV ? 24 : 18,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  navActions: {
    flexDirection: 'row',
    gap: 12
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  navBtnActive: {
    backgroundColor: '#1E1E2C'
  },
  navBtnText: {
    color: '#E2E8F0',
    fontSize: isTV ? 16 : 13,
    fontWeight: '600'
  },
  screenContainer: {
    flex: 1
  }
});
