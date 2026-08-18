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

  // Multi-frame autonomous script injected into BOTH the main frame and all player iframes
  const autoPlayScript = `
    (function() {
      try {
        // Block window.open ad popups
        window.open = function() {
          return { focus: function(){}, close: function(){} };
        };
        
        // Neutralize click-jacking redirects
        document.addEventListener('click', function(e) {
          var target = e.target;
          var link = target ? target.closest('a') : null;
          if (link) {
            var href = (link.href || '').toLowerCase();
            if (
              href.includes('aliexpress') ||
              href.includes('adsterra') ||
              href.includes('popunder') ||
              href.includes('popads') ||
              href.includes('doubleclick') ||
              href.includes('s.click') ||
              href.includes('exoclick') ||
              href.includes('push-sdk')
            ) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
            if (link.target === '_blank') {
              link.removeAttribute('target');
            }
          }
        }, true);

        // Inject fullscreen & clean overlay CSS
        var style = document.createElement('style');
        style.id = 'clean-native-player-fullscreen';
        style.innerHTML = \`
          html, body {
            background-color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            width: 100vw !important;
            height: 100vh !important;
          }
          
          /* Hide unwanted site overlays, comments, chats and ad banners */
          .adsbygoogle, .ad-banner, .popunder, .popup,
          #cbox, .cbox, #cboxdiv, [id*="cbox"], [class*="cbox"], iframe[src*="cbox"], iframe[src*="chat"],
          #comments, .comments, .comments-tab, #com-list, #mComms, #com-add-form,
          iframe[src*="newsletter"], iframe[src*="facebook"], iframe[src*="comments"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            pointer-events: none !important;
          }

          /* Force Video & Player containers to fill viewport */
          #player-frame, .content-player, #vplayer, #player, .player-container, .watching-player,
          video, .jwplayer, .video-js,
          iframe[src*="byse"], iframe[src*="vidara"], iframe[src*="vk"], iframe[src*="ok"], iframe[src*="send"], iframe[src*="waaw"], iframe[src*="player"], iframe[src*="strp2p"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            background: #000000 !important;
            border: none !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        \`;
        if (!document.getElementById('clean-native-player-fullscreen')) {
          document.head.appendChild(style);
        }

        // Helper to dispatch synthetic full user click sequence
        function fireClick(element) {
          if (!element) return;
          try {
            var rect = element.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var opts = { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy };
            
            element.dispatchEvent(new MouseEvent('mousedown', opts));
            element.dispatchEvent(new MouseEvent('mouseup', opts));
            element.dispatchEvent(new MouseEvent('click', opts));
            if (typeof element.click === 'function') {
              element.click();
            }
          } catch(e) {}
        }

        // Auto-Trigger Loop (Runs in Top Frame & inside player Iframes)
        function autoPlayLoop() {
          // 1. Click all play buttons, covers, SVGs, polygons, and icons
          var playElements = document.querySelectorAll(
            '#frame-cover, #player-frame > a, .film-play, .btn-play, .play-btn, .pv_play_btn, .videoplayer_play, ' +
            '.do-player-option, #player-option-1, [data-type="movie_iframe_link"], .options-player li, ' +
            '.vjs-big-play-button, .jw-display-icon-container, .jw-icon-display, .jw-preview, ' +
            '[class*="play-button"], [class*="play-icon"], [class*="play"], [id*="play"], button[title*="Play"], ' +
            'svg, path, polygon, canvas, button'
          );
          playElements.forEach(function(el) {
            fireClick(el);
          });

          // 2. Target HTML5 Video elements and force auto-play
          var vids = document.querySelectorAll('video');
          vids.forEach(function(v) {
            try {
              v.style.setProperty('width', '100vw', 'important');
              v.style.setProperty('height', '100vh', 'important');
              if (v.paused && typeof v.play === 'function') {
                v.muted = true; // bypass gesture requirement
                var p = v.play();
                if (p && typeof p.then === 'function') {
                  p.then(function() {
                    setTimeout(function() { v.muted = false; }, 400);
                  }).catch(function() {
                    v.play();
                  });
                }
              }
            } catch(e){}
          });

          // 3. Multi-point coordinate taps (Targets center-right & center play overlays)
          var tapPoints = [
            [0.50, 0.50],
            [0.75, 0.35],
            [0.70, 0.30],
            [0.65, 0.40],
            [0.50, 0.40]
          ];
          tapPoints.forEach(function(pt) {
            try {
              var x = window.innerWidth * pt[0];
              var y = window.innerHeight * pt[1];
              var targetElem = document.elementFromPoint(x, y);
              if (targetElem && targetElem.tagName !== 'HTML' && targetElem.tagName !== 'BODY') {
                fireClick(targetElem);
              }
            } catch(e){}
          });

          // 4. Expand and trigger nested iframes
          var iframes = document.querySelectorAll('iframe');
          iframes.forEach(function(f) {
            if (f.src && !f.src.includes('about:blank') && !f.src.includes('cbox') && !f.src.includes('facebook')) {
              f.style.setProperty('position', 'fixed', 'important');
              f.style.setProperty('top', '0px', 'important');
              f.style.setProperty('left', '0px', 'important');
              f.style.setProperty('width', '100vw', 'important');
              f.style.setProperty('height', '100vh', 'important');
              f.style.setProperty('z-index', '999999', 'important');

              try {
                var doc = f.contentDocument || (f.contentWindow ? f.contentWindow.document : null);
                if (doc) {
                  var innerTargets = doc.querySelectorAll('.vjs-big-play-button, .jw-display-icon-container, video, [class*="play"], svg, polygon, button');
                  innerTargets.forEach(function(ib) {
                    fireClick(ib);
                  });
                  var innerVids = doc.querySelectorAll('video');
                  innerVids.forEach(function(iv) {
                    if (iv.paused && typeof iv.play === 'function') {
                      iv.muted = true;
                      iv.play();
                    }
                  });
                }
              } catch(crossErr){}
            }
          });
        }

        autoPlayLoop();
        var timer = setInterval(autoPlayLoop, 300);

        setTimeout(function() {
          clearInterval(timer);
          setInterval(autoPlayLoop, 1500);
        }, 10000);

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
          injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
          injectedJavaScriptBeforeContentLoaded={autoPlayScript}
          injectedJavaScript={autoPlayScript}
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
