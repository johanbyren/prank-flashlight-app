import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { API_URL, STRIPE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY } from './config';
import { StripeProvider, useStripe } from './stripe';

const stripeReturnURL =
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/stripe-redirect')
    : Linking.createURL('stripe-redirect');

function FlashlightApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [hasUnlimitedAccess, setHasUnlimitedAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const turnOnFlashlight = () => {
    if (!isFlashlightOn) {
      setIsFlashlightOn(true);
    }
  };

  const requestTurnOff = () => {
    if (!isFlashlightOn) return;

    if (hasUnlimitedAccess) {
      setIsFlashlightOn(false);
      return;
    }

    setShowPaywall(true);
  };

  const completeTurnOff = ({ unlimited = false } = {}) => {
    if (unlimited) {
      setHasUnlimitedAccess(true);
    }
    setIsFlashlightOn(false);
    setShowPaywall(false);
  };

  const initializePayment = async (plan) => {
    setLoading(true);
    setShowPaywall(false);

    // DEMO MODE — UI test without Stripe
    if (API_URL === 'DEMO') {
      setLoading(false);
      const isSubscription = plan === 'subscription';
      Alert.alert(
        'Demo Mode',
        isSubscription
          ? 'In a real build, Stripe would start a $19/month subscription here.\n\nUnlock unlimited on/off now?'
          : 'In a real build, Stripe would charge $99 here.\n\nTurn the flashlight off now?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              Alert.alert('Payment canceled', 'The flashlight is still on.');
            },
          },
          {
            text: isSubscription ? 'Subscribe' : 'Pay $99',
            onPress: () => {
              completeTurnOff({ unlimited: isSubscription });
              Alert.alert(
                'Payment received',
                isSubscription
                  ? 'Unlimited on/off unlocked. Thanks for the money.'
                  : 'Thanks for your money. Flashlight is off.'
              );
            },
          },
        ]
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY
            ? {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              }
            : {}),
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Payment error', data.error || 'Payment failed');
        setLoading(false);
        return;
      }

      const { clientSecret, customerId, ephemeralKey } = data;
      if (!clientSecret) {
        Alert.alert('Payment error', 'No client secret returned from server.');
        setLoading(false);
        return;
      }

      // Let the paywall modal finish closing before presenting Stripe UI
      await new Promise((resolve) => setTimeout(resolve, 350));

      const sheetParams = {
        merchantDisplayName: 'Candela',
        paymentIntentClientSecret: clientSecret,
        returnURL: stripeReturnURL,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: 'Friend',
        },
      };

      // Subscriptions need customer + ephemeral key for Payment Sheet
      if (plan === 'subscription' && customerId && ephemeralKey) {
        sheetParams.customerId = customerId;
        sheetParams.customerEphemeralKeySecret = ephemeralKey;
      }

      const { error: initError } = await initPaymentSheet(sheetParams);

      if (initError) {
        console.error('initPaymentSheet error', initError);
        Alert.alert(
          'Stripe init failed',
          initError.message || JSON.stringify(initError)
        );
        setLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();
      setLoading(false);

      if (presentError) {
        console.error('presentPaymentSheet error', presentError);
        if (presentError.code === 'Canceled') {
          Alert.alert('Payment canceled', 'The flashlight is still on.');
        } else {
          Alert.alert(
            'Stripe error',
            presentError.message || presentError.code || 'Could not open payment sheet'
          );
        }
        return;
      }

      completeTurnOff({ unlimited: plan === 'subscription' });
      Alert.alert(
        'Payment received',
        plan === 'subscription'
          ? 'Unlimited on/off unlocked. Thanks for the money.'
          : 'Thanks for your money. Flashlight is off.'
      );
    } catch (error) {
      console.error('initializePayment error', error);
      Alert.alert(
        'Error',
        error?.message || 'Could not connect to the server. Is the backend running?'
      );
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No camera access</Text>
        <Text style={styles.infoText}>
          This app needs camera permission to control the flashlight.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <CameraView
          style={styles.hiddenCamera}
          facing="back"
          enableTorch={isFlashlightOn}
        />
      )}

      <View style={styles.content}>
        <View
          style={[
            styles.controlRing,
            isFlashlightOn && styles.controlRingOn,
          ]}
        >
          {isFlashlightOn ? (
            <View style={styles.controlButtonOn}>
              <MaterialCommunityIcons
                name="flashlight"
                size={72}
                color="#1c1c1e"
              />
            </View>
          ) : (
            <BlurView intensity={40} tint="dark" style={styles.controlButtonOff}>
              <MaterialCommunityIcons
                name="flashlight-off"
                size={72}
                color="#f2f2f7"
              />
            </BlurView>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isFlashlightOn && styles.actionButtonActive,
            ]}
            onPress={turnOnFlashlight}
            disabled={isFlashlightOn || loading}
            activeOpacity={0.7}
          >
            <BlurView intensity={50} tint="dark" style={styles.actionButtonBlur}>
              <Text style={styles.actionButtonLabel}>ON</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              !isFlashlightOn && styles.actionButtonActive,
            ]}
            onPress={requestTurnOff}
            disabled={!isFlashlightOn || loading}
            activeOpacity={0.7}
          >
            <BlurView intensity={50} tint="dark" style={styles.actionButtonBlur}>
              <Text style={styles.actionButtonLabel}>
                {loading ? '...' : 'OFF'}
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showPaywall}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaywall(false)}
      >
        <Pressable style={styles.paywallBackdrop} onPress={() => setShowPaywall(false)}>
          <Pressable style={styles.paywallCard} onPress={() => {}}>
            <Text style={styles.paywallTitle}>Turn Flashlight Off</Text>
            <Text style={styles.paywallSubtitle}>
              Choose how you want to turn it off.
            </Text>

            <TouchableOpacity
              style={styles.planButton}
              onPress={() => initializePayment('once')}
              disabled={loading}
            >
              <View style={styles.planTextWrap}>
                <Text style={styles.planTitle}>Turn off once</Text>
                <Text style={styles.planDescription}>One-time payment</Text>
              </View>
              <Text style={styles.planPrice}>$99</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planButton, styles.planButtonSecondary]}
              onPress={() => initializePayment('subscription')}
              disabled={loading}
            >
              <View style={styles.planTextWrap}>
                <Text style={styles.planTitle}>Unlimited on/off</Text>
                <Text style={styles.planDescription}>Subscription</Text>
              </View>
              <Text style={styles.planPrice}>$19/mo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPaywall(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.prankflashlight"
      urlScheme={
        Constants.appOwnership === 'expo'
          ? Linking.createURL('/--/').split(':')[0]
          : 'prankflashlight'
      }
    >
      <FlashlightApp />
    </StripeProvider>
  );
}

const CONTROL_SIZE = 168;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hiddenCamera: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlRing: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: CONTROL_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(120, 120, 128, 0.28)',
  },
  controlRingOn: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 12,
  },
  controlButtonOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonOn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 56,
  },
  actionButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    opacity: 0.55,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionButtonActive: {
    opacity: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  actionButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
  },
  paywallBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  paywallCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 22,
  },
  paywallTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  paywallSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  planButton: {
    backgroundColor: '#0a84ff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planButtonSecondary: {
    backgroundColor: 'rgba(120, 120, 128, 0.36)',
  },
  planTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  planTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  planDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  planPrice: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 17,
    fontWeight: '500',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 'auto',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    color: '#ffffff',
    opacity: 0.7,
    lineHeight: 20,
    alignSelf: 'center',
  },
  permissionButton: {
    marginTop: 24,
    marginBottom: 'auto',
    backgroundColor: 'rgba(120, 120, 128, 0.36)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 22,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
