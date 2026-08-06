import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { API_URL } from './config';

const { width, height } = Dimensions.get('window');

function FlashlightApp() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const glowAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isFlashlightOn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnimation.setValue(0);
    }
  }, [isFlashlightOn]);

  const turnOnFlashlight = async () => {
    if (!isFlashlightOn) {
      setIsFlashlightOn(true);
      await Camera.toggleTorchAsync(true);
    }
  };

  const turnOffFlashlight = async () => {
    if (isFlashlightOn) {
      // PRANK TIME! 💸
      Alert.alert(
        '🔦 Släck ficklampa',
        'För att släcka ficklampan behöver du betala en liten avgift på 200 kr 😈',
        [
          {
            text: 'Avbryt',
            style: 'cancel',
          },
          {
            text: 'Betala 200 kr',
            onPress: initializePayment,
          },
        ]
      );
    }
  };

  const initializePayment = async () => {
    setLoading(true);
    
    // DEMO MODE - Testa UI utan backend
    if (API_URL === 'DEMO') {
      setLoading(false);
      Alert.alert(
        '🎭 DEMO MODE',
        'Detta är demo-läge för att testa UI:n!\n\nI riktigt läge skulle Stripe Payment Sheet öppnas här.\n\nVill du "betala" och släcka lampan?',
        [
          {
            text: 'Avbryt',
            style: 'cancel',
            onPress: () => {
              Alert.alert('Betalning avbruten', 'Lampan är fortfarande på! 😈');
            }
          },
          {
            text: 'Ja, "betala"',
            onPress: async () => {
              Alert.alert(
                '💰 "Betalning" mottagen!',
                'Tack för dina "pengar"! Lampan släcks nu. 😂\n\n(I riktigt läge skulle 200 kr tas via Stripe)',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await Camera.toggleTorchAsync(false);
                      setIsFlashlightOn(false);
                    },
                  },
                ]
              );
            },
          },
        ]
      );
      return;
    }
    
    try {
      // Hämta payment intent från backend
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { clientSecret, publishableKey } = await response.json();
      setPublishableKey(publishableKey);

      // Initiera Stripe Payment Sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Prank Flashlight AB',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'Din Kompis',
        },
      });

      if (error) {
        Alert.alert('Fel', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      // Visa betalnings-sheet
      openPaymentSheet();
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte ansluta till servern. Är backend igång?');
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert('Betalning avbruten', 'Lampan är fortfarande på! 😈');
    } else {
      // Betalning lyckades! Släck lampan
      Alert.alert(
        '💰 Betalning mottagen!',
        'Tack för dina pengar! Lampan släcks nu. 😂',
        [
          {
            text: 'OK',
            onPress: async () => {
              await Camera.toggleTorchAsync(false);
              setIsFlashlightOn(false);
            },
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Begär kamera-tillstånd...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen tillgång till kamera</Text>
        <Text style={styles.infoText}>
          Denna app behöver kamera-tillstånd för att kunna använda ficklampan
        </Text>
      </View>
    );
  }

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <LinearGradient
      colors={isFlashlightOn ? ['#1a1a1a', '#2d2d2d', '#1a1a1a'] : ['#000000', '#1a1a1a', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Flashlight Icon */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.glowOuter,
              isFlashlightOn && {
                opacity: glowOpacity,
                transform: [
                  {
                    scale: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={[styles.flashlightIcon, isFlashlightOn && styles.flashlightIconOn]}>
            <View style={styles.flashlightBody}>
              <View style={[styles.flashlightTop, isFlashlightOn && styles.flashlightTopOn]} />
            </View>
          </View>
        </View>

        {/* Status Text */}
        <Text style={styles.statusText}>
          {isFlashlightOn ? 'TÄND' : 'SLÄCKT'}
        </Text>

        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          {/* ON Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isFlashlightOn && styles.controlButtonActive,
            ]}
            onPress={turnOnFlashlight}
            disabled={isFlashlightOn}
            activeOpacity={0.7}
          >
            <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonLabel}>ON</Text>
                <Text style={styles.buttonSubtext}>Gratis</Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* OFF Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isFlashlightOn && styles.controlButtonActive,
            ]}
            onPress={turnOffFlashlight}
            disabled={!isFlashlightOn || loading}
            activeOpacity={0.7}
          >
            <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonLabel}>OFF</Text>
                <Text style={styles.buttonSubtext}>
                  {loading ? 'Laddar...' : '200 kr'}
                </Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Subtle hint */}
        {isFlashlightOn && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              💡 Lampan lyser starkt
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_placeholder"
      merchantIdentifier="merchant.com.prankflashlight"
    >
      <FlashlightApp />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  
  // Flashlight Icon Styles
  iconContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFE066',
    opacity: 0,
  },
  flashlightIcon: {
    width: 120,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flashlightBody: {
    width: 60,
    height: 100,
    backgroundColor: '#4a4a4a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  flashlightTop: {
    width: 60,
    height: 30,
    backgroundColor: '#5a5a5a',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  flashlightTopOn: {
    backgroundColor: '#FFE066',
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  flashlightIconOn: {
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  
  // Status Text
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: 50,
    opacity: 0.7,
  },
  
  // Buttons Container
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  
  // Control Buttons
  controlButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    opacity: 0.6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButtonActive: {
    opacity: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '500',
  },
  
  // Hint
  hintContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
  },
  
  // Loading & Error States
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    color: '#ffffff',
    opacity: 0.7,
    lineHeight: 20,
  },
});
