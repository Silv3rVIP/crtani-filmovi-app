import React from 'react';
import VideoPlayer from '../components/VideoPlayer';

export default function PlayerScreen({ route, navigation }) {
  const { embedUrl = 'https://crtanifilmovielena.com', title = 'Sinhronizovani Crtani Film' } = route?.params || {};

  return (
    <VideoPlayer
      embedUrl={embedUrl}
      title={title}
      onClose={() => navigation?.goBack()}
    />
  );
}
