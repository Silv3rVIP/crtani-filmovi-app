import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { searchMovies } from '../api/scraper';
import MovieCard from '../components/MovieCard';
import { isTV } from '../utils/device';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim().length > 1) {
      setLoading(true);
      const data = await searchMovies(text);
      setResults(data);
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const handleSelectMovie = (movie) => {
    navigation.navigate('Detail', { movie });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.input}
          placeholder="Pretraži crtani film (npr. Moana, Grozan ja)..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={handleSearch}
          autoFocus={isTV}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00E5FF" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `srch-${item?.id || 'doc'}-${idx}`}
          numColumns={isTV ? 4 : 2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <MovieCard movie={item} onPress={handleSelectMovie} />
            </View>
          )}
          ListEmptyComponent={
            query.length > 1 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>Nema pronađenih crtanih filmova za "{query}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12',
    padding: isTV ? 32 : 16
  },
  header: {
    marginBottom: 24
  },
  input: {
    backgroundColor: '#1E1E2C',
    color: '#F8FAFC',
    fontSize: isTV ? 20 : 16,
    paddingHorizontal: 20,
    paddingVertical: isTV ? 16 : 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155'
  },
  list: {
    paddingBottom: 40
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: isTV ? 18 : 14
  }
});
