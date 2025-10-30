import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://supernova-sable.vercel.app/';
const PRIMARY_BLUE = '#1C75BC';
const HIDE_MENUS_JS = `
  (function() {
    const LABELS = ['promotions', 'affiliate'];
    const shouldHide = (nodeText, label) => {
      if (!nodeText) {
        return false;
      }
      const normalized = nodeText.trim().toLowerCase();
      return (
        normalized === label ||
        normalized.startsWith(label + ' ') ||
        normalized.includes(label + ' ') ||
        normalized.endsWith(' ' + label)
      );
    };
    const hideNode = (node) => {
      if (!node) {
        return;
      }
      const target = node.closest('li, a, button, [role="menuitem"]') || node;
      if (target && target.style) {
        target.style.setProperty('display', 'none', 'important');
      }
    };
    const hideMenus = () => {
      const selectors = ['nav a', 'nav button', 'nav li', 'header a', 'header button', 'header li', '[role="navigation"] a', '[role="navigation"] button', '[role="navigation"] li', '[role="menuitem"]', 'a', 'button'];
      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        LABELS.forEach((label) => {
          elements.forEach((element) => {
            if (shouldHide(element.textContent, label)) {
              hideNode(element);
            }
          });
        });
      });
    };
    const observer = new MutationObserver(() => hideMenus());
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    hideMenus();
  })();
  true;
`;

export default function App() {
  const webViewRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const isAndroid = Platform.OS === 'android';
  const statusBarInset = isAndroid ? RNStatusBar.currentHeight ?? 0 : 0;

  const isMainFrameNavigation = useCallback((event) => {
    if (!event) {
      return true;
    }

    if (event.isTopFrame === false) {
      return false;
    }

    if (event.mainDocumentURL && event.url && event.mainDocumentURL !== event.url) {
      return false;
    }

    return true;
  }, []);

  const handleShouldStartLoadWithRequest = useCallback((event) => {
    if (!isMainFrameNavigation(event)) {
      return true;
    }

    const targetUrl = event.url ?? '';
    const normalizedAppUrl = APP_URL.replace(/\/$/, '').toLowerCase();
    const targetUrlLower = targetUrl.toLowerCase();

    if (!targetUrl) {
      return false;
    }

    if (
      targetUrlLower.startsWith('about:blank') ||
      targetUrlLower.startsWith('data:') ||
      targetUrlLower.startsWith('blob:') ||
      targetUrlLower.startsWith(normalizedAppUrl)
    ) {
      return true;
    }

    let externalUrl = targetUrl;

    if (targetUrlLower.startsWith('intent://')) {
      externalUrl = targetUrl.replace('intent://', 'https://');
    }

    setIsInitialLoading(false);
    Linking.openURL(externalUrl).catch(() => undefined);
    return false;
  }, [isMainFrameNavigation]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsInitialLoading(false);
  }, []);

  const handleNavigationStateChange = useCallback((navState) => {
    if (!navState) {
      return;
    }

    if (typeof navState.canGoBack === 'boolean') {
      setCanGoBack(navState.canGoBack);
    }
  }, []);

  const handleReload = useCallback(() => {
    setHasError(false);
    setIsInitialLoading(true);
    webViewRef.current?.reload();
  }, []);

  useEffect(() => {
    if (!isAndroid) {
      return;
    }

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }

      Alert.alert(
        'Exit App',
        'Do you want to exit?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );

      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack, isAndroid]);

  const platformProps = useMemo(
    () =>
      Platform.select({
        android: {
          allowFileAccess: true,
          setSupportMultipleWindows: false,
        },
        ios: {
          allowingReadAccessToURL: APP_URL,
        },
        default: {},
      }) ?? {},
    []
  );

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="light" backgroundColor={PRIMARY_BLUE} translucent />
      <SafeAreaView style={[styles.container, isAndroid ? { paddingTop: statusBarInset } : undefined]}>
        <View style={styles.content}>
          {!hasError && (
            <WebView
              ref={webViewRef}
              source={{ uri: APP_URL }}
              onLoadStart={({ nativeEvent }) => {
                if (!isMainFrameNavigation(nativeEvent)) {
                  return;
                }
                setHasError(false);
              }}
              onLoadEnd={({ nativeEvent }) => {
                if (!isMainFrameNavigation(nativeEvent)) {
                  return;
                }
                setIsInitialLoading(false);
              }}
              onError={handleError}
              javaScriptEnabled
              domStorageEnabled
              cacheEnabled
              allowsInlineMediaPlayback
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onNavigationStateChange={handleNavigationStateChange}
              pullToRefreshEnabled={isAndroid}
              injectedJavaScript={HIDE_MENUS_JS}
              {...platformProps}
              style={styles.webView}
            />
          )}
          {isInitialLoading && !hasError && (
            <View style={styles.initialLoadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#00ADEF" />
            </View>
          )}
          {hasError && (
            <View style={styles.errorOverlay}>
              <View style={styles.errorCard}>
                <Image source={require('./assets/logo.png')} style={styles.brandLogo} resizeMode="contain" />
                <Text style={styles.errorTitle}>Connection Issue</Text>
                <Text style={styles.errorMessage}>
                  We couldn't load Super Nova. Check your internet connection and try again.
                </Text>
                <Pressable
                  onPress={handleReload}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
                >
                  <Text style={styles.retryButtonText}>Reload</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY_BLUE,
  },
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BLUE,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  initialLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 32,
  },
  errorCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#0b1a29',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    alignItems: 'center',
  },
  brandLogo: {
    width: 180,
    height: 80,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12263A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#3C4F67',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: '#00ADEF',
  },
  retryButtonPressed: {
    backgroundColor: '#0088C1',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
