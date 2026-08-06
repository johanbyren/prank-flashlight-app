import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { API_URL } from './config';

function FlashlightApp() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleFlashlight = async () => {
    if (!isFlashlightOn) {
      // Tända lampan - detta är gratis! 😈
      setIsFlashlightOn(true);
      await Camera.toggleTorchAsync(true);
    } else {
      // Försöker släcka lampan - PRANK TIME! 💸
      Alert.alert(
        '🔦 Släck ficklampa?',
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
        <Text>Begär kamera-tillstånd...</Text>
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

  return (
    <View style={[styles.container, isFlashlightOn && styles.lightOn]}>
      <View style={styles.content}>
        <Text style={styles.title}>🔦 Prank Ficklampa</Text>
        
        <Text style={styles.subtitle}>
          {isFlashlightOn 
            ? '💡 Lampan är tänd!' 
            : '🌙 Lampan är släckt'}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            isFlashlightOn ? styles.buttonOn : styles.buttonOff,
            loading && styles.buttonDisabled,
          ]}
          onPress={toggleFlashlight}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? '⏳ Laddar...'
              : isFlashlightOn
              ? '💸 Släck (200 kr)'
              : '✨ Tänd (Gratis!)'}
          </Text>
        </TouchableOpacity>

        {isFlashlightOn && (
          <View style={styles.prankHint}>
            <Text style={styles.prankHintText}>
              😈 Tänk på att det kostar pengar att släcka!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎭 En prank-app av dig till dina kompisar
        </Text>
      </View>
    </View>
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
    backgroundColor: '#1a1a2e',
  },
  lightOn: {
    backgroundColor: '#fff9e6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 250,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonOff: {
    backgroundColor: '#4CAF50',
  },
  buttonOn: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  prankHint: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  prankHintText: {
    color: '#856404',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    opacity: 0.7,
  },
});
