import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview'; // Fallback / embed support
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

export default function VideoPlayer({ embedUrl, title, onClose }) {
  const [loading, setLoading] = useState(true);

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

  const [currentUrl, setCurrentUrl] = useState(normalizeUrl(embedUrl));

  // Inject JavaScript to transform site and VK video embeds into a native edge-to-edge player, block ad popups, and auto-play
  const injectedJavaScript = `
    (function() {
      try {
        // Block window.open ad popups
        window.open = function() {
          return { focus: function(){}, close: function(){} };
        };
        
        // Neutralize click-jacking ad overlays and redirect links
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
              href.includes('exoclick')
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

        // Remove blocking ad overlays over the video player
        function removeOverlays() {
          var overlays = document.querySelectorAll('div[id*="pop"], div[class*="pop"], [class*="ad-overlay"], [id*="ad-overlay"]');
          overlays.forEach(function(el) {
            if (el && el.tagName !== 'VIDEO' && el.tagName !== 'IFRAME') {
              try { el.remove(); } catch(err) {}
            }
          });
        }

        var style = document.createElement('style');
        style.id = 'native-player-fullscreen';
        style.innerHTML = \`
          html, body {
            background-color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Hide non-video site chrome, titles, sidebars, VK headers, ad banners, and comments sections */
          header, footer, nav, .navbar, .sidebar, #header, #footer, .site-header, .site-footer,
          .top-header, .main-header, .film-desc, .breadcrumb, .social-share,
          .adsbygoogle, .ad-banner, .popunder, .popup,
          #comments, .comments, .comments-tab, #com-list, .com-title, #add-comm,
          .comment-block, #mComms, #com-add-form, .comm-body, .comm-rec, .u-comm, #soc-comments,
          iframe[src*="newsletter"], iframe[src*="campaign"], iframe[id*="iFb"], iframe[src*="facebook"], iframe[src*="comments"],
          .mv_title, .mv_author, .mv_info, .mv_actions, .videoplayer_top, .videoplayer_title,
          .VideoPage__leftColumn, .VideoPage__rightColumn, .HeaderNav, .SideMenu {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* Force video & iframe containers to fill screen */
          iframe, video, #app, #player, .player-container, #player-frame {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            outline: none !important;
            background: #000000 !important;
            object-fit: contain !important;
          }
        \`;
        if (!document.getElementById('native-player-fullscreen')) {
          document.head.appendChild(style);
        }

        function enforceNativeLayout() {
          removeOverlays();

          // Hide comments & social blocks dynamically
          var comms = document.querySelectorAll('#comments, .comments, [class*="comment"], [id*="comment"], #com-list, #mComms');
          comms.forEach(function(c) {
            try { c.style.setProperty('display', 'none', 'important'); } catch(e) {}
          });

          // Promote real video iframe / video element to top-level fixed z-index: 999999
          var videoPlayerElements = document.querySelectorAll('video, iframe[src*="byse"], iframe[src*="vidara"], iframe[src*="vk"], iframe[src*="ok"], iframe[src*="send"], iframe[src*="waaw"], iframe[src*="player"], iframe[src*="embed"], #player-frame iframe');
          videoPlayerElements.forEach(function(el) {
            el.style.setProperty('position', 'fixed', 'important');
            el.style.setProperty('top', '0px', 'important');
            el.style.setProperty('left', '0px', 'important');
            el.style.setProperty('width', '100vw', 'important');
            el.style.setProperty('height', '100vh', 'important');
            el.style.setProperty('z-index', '999999', 'important');
            el.style.setProperty('background', '#000000', 'important');
          });
          var iframes = document.querySelectorAll('iframe');
          iframes.forEach(function(f) {
            if (!f.src || f.src === 'about:blank' || f.src.includes('about:blank')) {
              var sBtn = document.querySelector('.do-player-option, #player-option-1, [data-type="movie_iframe_link"], .options-player li');
              if (sBtn) { try { sBtn.click(); } catch(e) {} }
            }
          });

          // Auto-click security verification buttons (e.g. send.now / send.cm / Cloudflare security check)
          var buttons = document.querySelectorAll('button, a, div, span, input[type="submit"]');
          buttons.forEach(function(btn) {
            var txt = (btn.innerText || btn.value || '').trim().toUpperCase();
            if (txt === 'CONTINUE' || txt === 'PROCEED' || txt === 'VERIFY' || txt === 'GLEDAJ FILM') {
              try { btn.click(); } catch(e) {}
            }
          });

          var playBtn = document.querySelector('#frame-cover, #player-frame > a, .film-play, .btn-play, .play-btn, .pv_play_btn, .videoplayer_play, .jw-icon-playback, .vjs-big-play-button');
          if (playBtn) { 
            try { playBtn.click(); } catch(e) {}
          }

          var vids = document.querySelectorAll('video');
          vids.forEach(function(v) {
            v.style.setProperty('width', '100%', 'important');
            v.style.setProperty('height', '100%', 'important');
            if (v.paused) {
              v.play().catch(function(){});
            }
          });
        }

        enforceNativeLayout();
        setInterval(enforceNativeLayout, 500);
      } catch(e) {}
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (onClose) onClose();
          }}
          activeOpacity={0.6}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          hasTVPreferredFocus={true}
        >
          <Text style={styles.closeButtonText}>✕ Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Video Player WebView */}
      <View style={styles.playerWrapper}>
        <WebView
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
          onLoadEnd={() => setLoading(false)}
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
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url.toLowerCase();
            // Block top frame popup redirects only (e.g. AliExpress, Adsterra)
            if (
              request.isTopFrame &&
              (
                url.includes('aliexpress') ||
                url.includes('adsterra') ||
                url.includes('popunder') ||
                url.includes('popads')
              )
            ) {
              console.log('Blocked ad popup:', url);
              return false;
            }
            return true;
          }}
          onError={(e) => {
            console.warn('WebView load error:', e.nativeEvent);
            setLoading(false);
          }}
          injectedJavaScript={injectedJavaScript}
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
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
    height: isTV ? 64 : 54,
    backgroundColor: '#0F0F1A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 99999,
    elevation: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2C'
  },
  closeButton: {
    backgroundColor: '#FF2A6D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 16,
    zIndex: 100000,
    elevation: 25
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
