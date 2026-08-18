import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { isTV } from '../utils/device';

function getRefererForUrl(url) {
  if (!url) return 'https://crtanifilmovielena.com/';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('strp2p.site')) {
      return 'https://player.strp2p.site/';
    }
    if (parsed.hostname.includes('send.cm')) {
      return 'https://send.cm/';
    }
    if (parsed.hostname.includes('waaw.ac')) {
      return 'https://waaw.ac/';
    }
    if (parsed.hostname.includes('byse') || parsed.hostname.includes('vidara') || parsed.hostname.includes('gledajcrtace')) {
      return 'https://www.gledajcrtace.net/';
    }
    return `${parsed.protocol}//${parsed.hostname}/`;
  } catch (e) {
    return 'https://crtanifilmovielena.com/';
  }
}

export default function VideoPlayer({ embedUrl, title, onClose, navigation }) {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(1);
  const webViewRef = useRef(null);

  // Normalize URL helper
  const normalizeUrl = (url) => {
    if (!url) return 'https://crtanifilmovielena.com';
    let target = url.trim();
    if (target.startsWith('//')) {
      target = 'https:' + target;
    } else if (target.startsWith('/')) {
      target = 'https://www.gledajcrtace.net' + target;
    }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    // Intercept VK watch page links and convert to clean iframe embed URL
    const vkMatch = target.match(/vk\.com\/video(-?[0-9]+)_([0-9]+)/i);
    if (vkMatch) {
      return `https://vk.com/video_ext.php?oid=${vkMatch[1]}&id=${vkMatch[2]}`;
    }
    return target;
  };

  const currentUrl = normalizeUrl(embedUrl);

  // Autonomous Multi-Phase Playback Engine
  const safeAutoPlayScript = `
    (function() {
      try {
        // Block popup windows & redirects
        try {
          window.open = function() { return { focus: function(){}, close: function(){} }; };
        } catch(e){}

        // Trigger Phase 1: Trigger Lena / StariCrtaci AJAX player loading immediately
        function triggerAjaxPlayer() {
          try {
            if (window.jQuery) {
              window.jQuery('#frame-cover').trigger('click');
              window.jQuery('#player-frame > a').trigger('click');
              window.jQuery('.film-play').trigger('click');
              window.jQuery('.do-player-option').trigger('click');
              window.jQuery('#player-option-1').trigger('click');
            }
          } catch(e){}

          try {
            var cover = document.querySelector('#frame-cover, #player-frame > a, .film-play, .btn-play');
            if (cover) {
              cover.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
              if (typeof cover.click === 'function') cover.click();
            }
          } catch(e){}
        }

        // Trigger Phase 2: Autonomous Play within video player and iframe
        function triggerPlayback() {
          triggerAjaxPlayer();

          // Target all play buttons, circular SVG icons, and wrappers
          try {
            var playElements = document.querySelectorAll(
              '#vplayer, .play-wrapper, .play-button, .play-btn, .pv_play_btn, .videoplayer_play, ' +
              '.vjs-big-play-button, .jw-display-icon-container, .jw-icon-display, .jw-preview, ' +
              '[class*="play-button"], [class*="play-icon"], [class*="play"], [id*="play"], button[title*="Play"], ' +
              'svg, polygon, canvas, button'
            );
            playElements.forEach(function(el) {
              try {
                var opts = { bubbles: true, cancelable: true, view: window };
                el.dispatchEvent(new MouseEvent('mousedown', opts));
                el.dispatchEvent(new MouseEvent('mouseup', opts));
                el.dispatchEvent(new MouseEvent('click', opts));
                if (typeof el.click === 'function') el.click();
              } catch(err){}
            });
          } catch(e){}

          // Target HTML5 Video elements and force unmuted play
          try {
            var vids = document.querySelectorAll('video');
            vids.forEach(function(v) {
              try {
                v.style.setProperty('width', '100vw', 'important');
                v.style.setProperty('height', '100vh', 'important');
                if (v.paused && typeof v.play === 'function') {
                  v.muted = true;
                  var p = v.play();
                  if (p && typeof p.then === 'function') {
                    p.then(function() {
                      setTimeout(function() { try { v.muted = false; } catch(err){} }, 300);
                    }).catch(function(){ try { v.play(); } catch(err){} });
                  }
                }
              } catch(err){}
            });
          } catch(e){}

          // Virtual Tap at Center & Center-Right coordinates
          try {
            var tapPoints = [[0.5, 0.5], [0.75, 0.35], [0.70, 0.30]];
            tapPoints.forEach(function(pt) {
              try {
                var x = window.innerWidth * pt[0];
                var y = window.innerHeight * pt[1];
                var el = document.elementFromPoint(x, y);
                if (el && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                  var opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };
                  el.dispatchEvent(new MouseEvent('mousedown', opts));
                  el.dispatchEvent(new MouseEvent('mouseup', opts));
                  el.dispatchEvent(new MouseEvent('click', opts));
                  if (typeof el.click === 'function') el.click();
                }
              } catch(err){}
            });
          } catch(e){}

          // Promote active iframe to full viewport
          try {
            var iframes = document.querySelectorAll('iframe');
            iframes.forEach(function(f) {
              if (f.src && !f.src.includes('about:blank') && !f.src.includes('cbox') && !f.src.includes('facebook')) {
                f.style.setProperty('position', 'fixed', 'important');
                f.style.setProperty('top', '0px', 'important');
                f.style.setProperty('left', '0px', 'important');
                f.style.setProperty('width', '100vw', 'important');
                f.style.setProperty('height', '100vh', 'important');
                f.style.setProperty('z-index', '999999', 'important');
                f.style.setProperty('background', '#000000', 'important');
                f.style.setProperty('border', 'none', 'important');
              }
            });
          } catch(e){}
        }

        // Run immediately and pulse every 400ms
        triggerPlayback();
        var timer = setInterval(triggerPlayback, 400);

        setTimeout(function() {
          clearInterval(timer);
          setInterval(triggerPlayback, 2000);
        }, 12000);

      } catch(e){}
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Top Floating Control Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (onClose) {
              onClose();
            } else if (navigation && typeof navigation.goBack === 'function') {
              navigation.goBack();
            }
          }}
          activeOpacity={0.7}
          hasTVPreferredFocus={true}
        >
          <Text style={styles.closeButtonText}>‹ Nazad</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {title || 'Sinhronizovani Crtani'}
        </Text>

        <TouchableOpacity
          style={styles.reloadButton}
          onPress={() => {
            setLoading(true);
            setKey(prev => prev + 1);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.reloadButtonText}>🔄 Osvježi</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player Engine */}
      <View style={styles.playerWrapper}>
        <WebView
          key={key}
          ref={webViewRef}
          originWhitelist={['*']}
          source={{
            uri: currentUrl,
            headers: {
              Referer: getRefererForUrl(currentUrl),
              'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
            }
          }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            setTimeout(() => setLoading(false), 1200);
          }}
          setSupportMultipleWindows={false}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          injectedJavaScriptForMainFrameOnly={false}
          injectedJavaScript={safeAutoPlayScript}
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url.toLowerCase();
            // Block ad popup redirects
            if (
              request.isTopFrame &&
              (
                url.includes('aliexpress') ||
                url.includes('adsterra') ||
                url.includes('popunder') ||
                url.includes('popads') ||
                url.includes('push-sdk')
              )
            ) {
              return false;
            }
            return true;
          }}
          onError={(e) => {
            console.warn('WebView load error:', e.nativeEvent);
            setLoading(false);
          }}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={styles.loadingText}>Priprema i pokretanje crtanog filma...</Text>
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
    zIndex: 99999,
    elevation: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2C'
  },
  closeButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 14,
    elevation: 10
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: isTV ? 16 : 14
  },
  title: {
    color: '#FFFFFF',
    fontSize: isTV ? 18 : 15,
    fontWeight: '700',
    flex: 1
  },
  reloadButton: {
    backgroundColor: '#1E1E2C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3047'
  },
  reloadButtonText: {
    color: '#CBD5E1',
    fontSize: isTV ? 14 : 12,
    fontWeight: '700'
  },
  playerWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000'
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 18, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99998
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 14,
    fontSize: isTV ? 16 : 14,
    fontWeight: '600'
  }
});
