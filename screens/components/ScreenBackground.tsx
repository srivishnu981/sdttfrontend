import React from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';

export default function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require('../../assets/campus-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
  flex: 1,
  paddingTop: 50,
  justifyContent: 'center',
},
});