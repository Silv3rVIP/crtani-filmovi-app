import { Platform, Dimensions } from 'react-native';

/**
 * Detects if the current device is an Android TV / Apple TV,
 * or if it should operate in TV Mode based on screen dimensions / TV flag.
 */
export const isTV = Platform.isTV || (Platform.OS === 'android' && Dimensions.get('window').width >= 960);

/**
 * Get device-specific design metrics
 */
export const getLayoutMetrics = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isTV,
    cardWidth: isTV ? 220 : 140,
    cardHeight: isTV ? 310 : 200,
    heroHeight: isTV ? 450 : 260,
    fontSize: {
      title: isTV ? 28 : 18,
      subtitle: isTV ? 18 : 14,
      body: isTV ? 16 : 12
    }
  };
};
