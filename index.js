import React from 'react';
import { Text, View } from 'react-native';
import { registerRootComponent } from 'expo';

function CrashScreen({ message }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#1c1c1e',
        justifyContent: 'center',
        padding: 28,
      }}
    >
      <Text
        style={{
          color: '#ff6b6b',
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 12,
        }}
      >
        Candela failed to start
      </Text>
      <Text style={{ color: '#ffffff', fontSize: 15, lineHeight: 22 }}>
        {message}
      </Text>
    </View>
  );
}

try {
  const App = require('./App').default;
  registerRootComponent(App);
} catch (error) {
  const message = error?.stack || error?.message || String(error);
  registerRootComponent(() => <CrashScreen message={message} />);
}
