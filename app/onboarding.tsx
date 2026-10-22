import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setOnboardingComplete } from '@/database/database';
import { radius, spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { Mark } from '@/components/Mark';

const slides = [
  { eyebrow: 'A BETTER WAY TO REMEMBER', title: 'Every connection,', subtitle: 'remembered.', art: 'card' },
  { eyebrow: 'PEOPLE, NOT PAPER', title: 'Never forget someone you meet.', subtitle: 'Keep the person, the contact, and the memory together.', art: 'memory' },
  { eyebrow: 'PRIVATE BY DESIGN', title: 'Your network. Your memory.', subtitle: 'Stored privately on your device.', art: 'private' },
] as const;

export default function Onboarding() {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const compact = height < 700;
  const styles = makeStyles(colors, compact);
  const [page, setPage] = useState(0);
  const slide = slides[page];
  const finish = async () => { await setOnboardingComplete(); router.replace('/'); };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} bounces={false}>
    <View style={styles.top}><Mark /><Text style={styles.wordmark}>Vemori</Text><Text style={styles.step}>{String(page + 1).padStart(2, '0')} / 03</Text></View>
    <View style={styles.artboard}>
      <View style={[styles.orbit, styles.orbitOuter]} /><View style={[styles.orbit, styles.orbitInner]} />
      <View style={styles.cardBack}><View style={styles.cardLogo}><Mark small /></View><View style={styles.cardLines}><View style={[styles.cardLine, { width: '74%' }]} /><View style={[styles.cardLine, { width: '52%' }]} /><View style={[styles.cardLine, { width: '66%' }]} /></View></View>
      <View style={styles.personCard}><View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View><View style={styles.personLines}><View style={[styles.personLine, { width: '80%' }]} /><View style={[styles.personLine, { width: '58%' }]} /><View style={[styles.personLine, { width: '70%' }]} /></View><Text style={styles.sparkle}>✦</Text></View>
      {slide.art === 'private' && <View style={styles.privacyBadge}><Text style={styles.lock}>⌑</Text><Text style={styles.badgeText}>ON YOUR DEVICE</Text></View>}
    </View>
    <View style={styles.copy}>
      <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
      <Text style={styles.title}>{slide.title}</Text>
      {slide.subtitle ? <Text style={styles.subtitle}>{slide.subtitle}</Text> : null}
    </View>
    <View style={styles.bottom}>
      <View style={styles.dots}>{slides.map((_, i) => <View key={i} style={[styles.dot, i === page && styles.dotActive]} />)}</View>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]} onPress={page === 2 ? finish : () => setPage(page + 1)}>
        <Text style={styles.buttonText}>{page === 2 ? 'Start using Vemori' : 'Continue'}</Text><Text style={styles.arrow}>→</Text>
      </Pressable>
      {page < 2 && <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}><Text style={styles.skip}>Skip intro</Text></Pressable>}
    </View>
  </ScrollView></SafeAreaView>;
}

const makeStyles = (colors: ThemeColors, compact: boolean) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  top: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 9 },
  wordmark: { fontSize: 16, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  step: { marginLeft: 'auto', color: colors.muted, fontSize: 11, letterSpacing: 1.4, fontWeight: '700' },
  artboard: { height: compact ? 220 : 300, minHeight: compact ? 220 : 260, maxHeight: 390, marginTop: 14, borderRadius: radius.xl, backgroundColor: colors.artboard, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: colors.border, borderRadius: 999 }, orbitOuter: { width: 300, height: 300 }, orbitInner: { width: 218, height: 218 },
  cardBack: { width: 212, height: 128, borderRadius: 14, backgroundColor: colors.accentSoft, padding: 18, transform: [{ rotate: '-9deg' }], position: 'absolute', left: '17%', top: '27%' },
  cardLogo: { marginBottom: 18 }, cardLines: { gap: 6 }, cardLine: { height: 4, borderRadius: 2, backgroundColor: colors.muted },
  personCard: { width: 205, height: 126, borderRadius: 14, backgroundColor: colors.paper, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 11, elevation: 8, shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, transform: [{ rotate: '5deg' }], position: 'absolute', right: '14%', bottom: '21%' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  personLines: { flex: 1, gap: 7 }, personLine: { height: 4, borderRadius: 2, backgroundColor: colors.border }, sparkle: { position: 'absolute', top: -18, right: 5, color: colors.accent, fontSize: 26 },
  privacyBadge: { position: 'absolute', bottom: 26, left: 25, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.artboard }, lock: { color: colors.accent, fontSize: 15 }, badgeText: { color: colors.inkSoft, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  copy: { flexGrow: 1, justifyContent: 'center', paddingTop: compact ? 16 : 20 }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginBottom: 14 }, title: { color: colors.ink, fontSize: compact ? 33 : 37, lineHeight: compact ? 38 : 42, fontWeight: '700', letterSpacing: -1.8, maxWidth: 340 }, subtitle: { color: colors.inkSoft, fontSize: 16, lineHeight: 24, marginTop: 11, maxWidth: 310 },
  bottom: { paddingBottom: spacing.lg, alignItems: 'center', gap: 17 }, dots: { flexDirection: 'row', gap: 7, marginBottom: 3 }, dot: { width: 5, height: 5, borderRadius: 5, backgroundColor: colors.border }, dotActive: { width: 20, backgroundColor: colors.accent },
  button: { width: '100%', height: 58, backgroundColor: colors.ink, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }, buttonText: { color: colors.paper, fontSize: 15, fontWeight: '700' }, arrow: { color: colors.paper, fontSize: 18, position: 'absolute', right: 22 }, skip: { color: colors.muted, fontSize: 13, padding: 3 },
});
