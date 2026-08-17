import React from 'react';
import VideoPlayer from '../components/VideoPlayer';

export default function PlayerScreen({ route, navigation }) {
  const { embedUrl, title } = route.params;

  return (
    <VideoPlayer
      embedUrl={embedUrl}
      title={title}
      onClose={() => navigation.goBack()}
    />
  );
}
