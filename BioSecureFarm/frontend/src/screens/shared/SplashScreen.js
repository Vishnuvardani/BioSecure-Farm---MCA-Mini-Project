import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing } from '../../theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
      ]),
      Animated.timing(taglineAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: 1500, useNativeDriver: false })
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0D6EFD', '#0A58CA', '#28A745']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconRow}>
          <Text style={styles.emoji}>🐷</Text>
          <View style={styles.shieldIcon}>
            <Text style={styles.shieldText}>🛡️</Text>
          </View>
          <Text style={styles.emoji}>🐔</Text>
        </View>
        <Text style={styles.appName}>BioSecure Farm</Text>
        <View style={styles.divider} />
      </Animated.View>

      <Animated.View style={{ opacity: taglineAnim }}>
        <Text style={styles.tagline}>AI & GIS Powered</Text>
        <Text style={styles.taglineSub}>Livestock Health Management</Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
          }]} />
        </View>
        <Text style={styles.loadingText}>Initializing secure environment...</Text>
      </View>

      <Text style={styles.version}>v1.0.0 | Powered by AI & GIS</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  emoji: { fontSize: 56 },
  shieldIcon: { marginHorizontal: Spacing.md },
  shieldText: { fontSize: 48 },
  appName: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1, textAlign: 'center' },
  divider: { width: 60, height: 3, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2, marginTop: Spacing.sm },
  tagline: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff', textAlign: 'center' },
  taglineSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4 },
  progressContainer: { position: 'absolute', bottom: 80, width: '80%', alignItems: 'center' },
  progressTrack: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  loadingText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginTop: Spacing.sm },
  version: { position: 'absolute', bottom: 30, color: 'rgba(255,255,255,0.5)', fontSize: FontSize.xs }
});
