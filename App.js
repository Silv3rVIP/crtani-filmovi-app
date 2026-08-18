import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import DetailScreen from './src/screens/DetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { isTV } from './src/utils/device';

function NavTab({ icon, label, isActive, onPress }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[
        styles.bottomTab,
        isActive && styles.bottomTabActive,
        isFocused && styles.bottomTabFocused
      ]}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[
        styles.tabLabel,
        isActive && styles.tabLabelActive,
        isFocused && styles.tabLabelFocused
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

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
    } else if (currentScreen === 'Detail' || currentScreen === 'Search' || currentScreen === 'Explore' || currentScreen === 'Library') {
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
        <StatusBar barStyle="light-content" backgroundColor="#090A10" />

        {/* Top Header Navbar */}
        {currentScreen !== 'Player' && (
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigate('Home')} activeOpacity={0.7} style={styles.logoRow}>
              <View style={styles.diamondLogo}>
                <Text style={styles.diamondText}>▶</Text>
              </View>
              <Text style={styles.brand}>
                Crtani <Text style={{ color: '#6C5CE7' }}>Elena TV</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate('Search')}
              style={styles.searchBtn}
            >
              <Text style={styles.searchBtnText}>🔍 Pretraga</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Screen Container */}
        <View style={styles.screenContainer}>
          {currentScreen === 'Home' && <HomeScreen navigation={navigationObj} />}
          {currentScreen === 'Explore' && <ExploreScreen navigation={navigationObj} />}
          {currentScreen === 'Library' && <LibraryScreen navigation={navigationObj} />}
          {currentScreen === 'Detail' && <DetailScreen route={{ params: screenParams }} navigation={navigationObj} />}
          {currentScreen === 'Search' && <SearchScreen navigation={navigationObj} />}
          {currentScreen === 'Player' && <PlayerScreen route={{ params: screenParams }} navigation={navigationObj} />}
        </View>

        {/* Stremio Bottom Navigation Bar */}
        {currentScreen !== 'Player' && (
          <View style={styles.bottomNav}>
            <NavTab icon="🏠" label="Početna" isActive={currentScreen === 'Home'} onPress={() => navigate('Home')} />
            <NavTab icon="🧭" label="Otkrij" isActive={currentScreen === 'Explore'} onPress={() => navigate('Explore')} />
            <NavTab icon="📚" label="Knjižnica" isActive={currentScreen === 'Library'} onPress={() => navigate('Library')} />
            <NavTab icon="🧩" label="Dodaci" isActive={false} onPress={() => navigate('Explore')} />
            <NavTab icon="⚙️" label="Postavke" isActive={false} onPress={() => navigate('Home')} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A10'
  },
  navbar: {
    height: isTV ? 60 : 50,
    backgroundColor: '#0D0E15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#161823'
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  diamondLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }]
  },
  diamondText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }]
  },
  brand: {
    color: '#FFFFFF',
    fontSize: isTV ? 20 : 16,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  searchBtn: {
    backgroundColor: '#161823',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242736'
  },
  searchBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600'
  },
  screenContainer: {
    flex: 1
  },
  bottomNav: {
    height: 58,
    backgroundColor: '#0D0E15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#161823',
    elevation: 8
  },
  bottomTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4
  },
  bottomTabActive: {
    opacity: 1
  },
  bottomTabFocused: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.12 }],
    shadowColor: '#6C5CE7',
    shadowRadius: 8,
    elevation: 8
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600'
  },
  tabLabelActive: {
    color: '#6C5CE7',
    fontWeight: '800'
  },
  tabLabelFocused: {
    color: '#FFFFFF',
    fontWeight: '900'
  }
});
