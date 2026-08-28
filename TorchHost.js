import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';

// iOS resets torch when AVCaptureSession actually starts running (~400ms after
// onCameraReady, deferred graph ~1.3s). enableTorch must change after that, or
// React never sends another native update.
const TORCH_AFTER_READY_MS = 1500;
const RETRY_GAP_MS = 120;

export default function TorchHost({ onMountError }) {
  const [torchOn, setTorchOn] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const latchTorch = () => {
    // Rising edge after the session is live. A second pulse covers the known
    // "first enable blinks off, second enable stays" iOS bug.
    setTorchOn(true);
    later(() => {
      setTorchOn(false);
      later(() => setTorchOn(true), RETRY_GAP_MS);
    }, RETRY_GAP_MS);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <View style={styles.torchHost} pointerEvents="none" collapsable={false}>
      <CameraView
        style={styles.camera}
        facing="back"
        mode="picture"
        enableTorch={torchOn}
        onCameraReady={() => later(latchTorch, TORCH_AFTER_READY_MS)}
        onMountError={onMountError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  torchHost: {
    position: 'absolute',
    width: 16,
    height: 16,
    top: 0,
    left: 0,
    opacity: 0.02,
    zIndex: 2,
    overflow: 'hidden',
  },
  camera: {
    width: 16,
    height: 16,
  },
});
