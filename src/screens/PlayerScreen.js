import React from 'react';
import VideoPlayer from '../components/VideoPlayer';

export default function PlayerScreen({ route, navigation }) {
  const { embedUrl = 'https://crtanifilmovielena.com', title = 'Sinhronizovani Crtani Film' } = route?.params || {};

  return (
    <VideoPlayer
      embedUrl={embedUrl}
      title={title}
      navigation={navigation}
      onClose={() => {
        try {
          if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
            navigation.goBack();
          } else if (navigation && typeof navigation.navigate === 'function') {
            navigation.navigate('Home');
          }
        } catch (e) {
          try { navigation?.goBack(); } catch(err){}
        }
      }}
    />
  );
}
