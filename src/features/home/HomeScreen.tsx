import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Mark } from '@/components/Mark';
import { radius, spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { listContacts } from '@/database/repositories/contactsRepository';
import type { ContactRecord } from '@/types/contact';

export function HomeScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [recent, setRecent] = useState<ContactRecord[]>([]);
  useFocusEffect(useCallback(() => { let active = true; listContacts().then((contacts) => { if (active) setRecent(contacts.slice(0, 3)); }).catch(() => { if (active) setRecent([]); }); return () => { active = false; }; }, []));
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View style={styles.brand}><Mark /><Text style={styles.brandName}>Contactory</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Open settings" onPress={() => router.push('/settings')} style={styles.profile}><Text style={styles.profileText}>A</Text></Pressable></View>
      <Text style={styles.greeting}>YOUR NETWORK STARTS HERE</Text>
      <Text style={styles.promise}>Never forget{ '\n' }someone you meet.</Text>
      <Text style={styles.tagline}>Every card has a story.{ '\n' }Remember yours.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Scan Card" style={({ pressed }) => [styles.scan, pressed && styles.scanPressed]} onPress={() => router.push('/scan')}>
        <View style={styles.scanTop}><View style={styles.camera}><View style={styles.lens} /></View><Text style={styles.scanHint}>YOUR NEXT CONNECTION STARTS HERE</Text></View>
        <View style={styles.scanBottom}><View><Text style={styles.scanTitle}>Scan Card</Text><Text style={styles.scanSub}>Capture a contact in seconds</Text></View><View style={styles.plus}><Text style={styles.plusText}>↗</Text></View></View>
        <View style={styles.glow} />
      </Pressable>
      <View style={styles.section}><View><Text style={styles.sectionTitle}>Your network</Text><Text style={styles.sectionSub}>People worth remembering</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/contacts')}><Text style={styles.seeAll}>VIEW ALL  ↗</Text></Pressable></View>
      {recent.length === 0 ? <View style={styles.empty}><View style={styles.emptyGlyph}><Mark small /></View><Text style={styles.emptyTitle}>A good place to start.</Text><Text style={styles.emptyText}>The next person you meet could{ '\n' }be the beginning of something.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/scan')}><Text style={styles.emptyLink}>Save your first connection  →</Text></Pressable></View> : <View style={styles.recentList}>{recent.map((contact) => {
        const initials = (contact.fullName || contact.company).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '•';
        return <Pressable accessibilityRole="button" key={contact.id} onPress={() => router.push({ pathname: '/contacts/[id]', params: { id: contact.id } })} style={styles.recentRow}><View style={styles.recentAvatar}><Text style={styles.recentAvatarText}>{initials}</Text></View><View style={{ flex: 1 }}><Text style={styles.recentName}>{contact.fullName || contact.company}</Text><Text style={styles.recentCompany}>{contact.company || contact.jobTitle || contact.email}</Text>{contact.notes[0]?.content ? <Text style={styles.recentNote} numberOfLines={1}>“{contact.notes[0].content}”</Text> : null}</View><Text style={styles.recentArrow}>›</Text></Pressable>;
      })}</View>}
      <View style={styles.footer}><Text style={styles.footerMark}>✳</Text><Text style={styles.footerText}>Your network, held close.</Text><View style={styles.localBadge}><View style={styles.localDot} /><Text style={styles.localText}>ON THIS DEVICE</Text></View></View>
    </ScrollView>
  </SafeAreaView>;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, content: { paddingHorizontal: spacing.xl, paddingBottom: 26 },
  header: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandName: { color: colors.ink, fontSize: 16, fontWeight: '700', letterSpacing: -0.4 }, profile: { width: 37, height: 37, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, profileText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  greeting: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: '800', marginTop: 27 }, promise: { color: colors.ink, fontWeight: '700', fontSize: 39, lineHeight: 43, letterSpacing: -1.8, marginTop: 13 }, tagline: { color: colors.inkSoft, fontSize: 15, lineHeight: 22, marginTop: 12 },
  scan: { height: 180, marginTop: 27, padding: 20, borderRadius: radius.lg, backgroundColor: colors.accentFill, overflow: 'hidden', justifyContent: 'space-between', elevation: 8, shadowColor: colors.shadow, shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }, scanPressed: { transform: [{ scale: 0.985 }] }, glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -30, top: -68, backgroundColor: colors.cardGlow, opacity: 0.1 }, scanTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, camera: { width: 37, height: 37, borderRadius: 13, backgroundColor: '#FFFFFF24', alignItems: 'center', justifyContent: 'center' }, lens: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.7, borderColor: '#F6F5EF' }, scanHint: { color: '#E2E9D9', fontSize: 9, letterSpacing: 1.1, fontWeight: '800' }, scanBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, scanTitle: { color: '#FFFDF8', fontSize: 25, letterSpacing: -0.8, fontWeight: '700' }, scanSub: { color: '#E1E7DB', fontSize: 13, marginTop: 4 }, plus: { height: 43, width: 43, borderRadius: 23, backgroundColor: '#FFFDF8', alignItems: 'center', justifyContent: 'center' }, plusText: { color: colors.accent, fontSize: 20 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 31 }, sectionTitle: { fontSize: 20, color: colors.ink, fontWeight: '700', letterSpacing: -0.5 }, sectionSub: { fontSize: 12, color: colors.muted, marginTop: 4 }, seeAll: { fontSize: 9, color: colors.accent, letterSpacing: 1.1, fontWeight: '800' },
  empty: { marginTop: 19, height: 197, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, emptyGlyph: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 12 }, emptyText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 }, emptyLink: { color: colors.accent, fontSize: 11, fontWeight: '700', marginTop: 10 }, recentList: { marginTop: 16, backgroundColor: colors.paper, borderRadius: radius.md, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 14, elevation: 2, shadowColor: colors.shadow, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, recentRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.border }, recentAvatar: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, recentAvatarText: { color: colors.accent, fontSize: 12, fontWeight: '800' }, recentName: { color: colors.ink, fontSize: 13, fontWeight: '700' }, recentCompany: { color: colors.inkSoft, fontSize: 10, marginTop: 3 }, recentNote: { color: colors.muted, fontSize: 9, marginTop: 3 }, recentArrow: { color: colors.muted, fontSize: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 23 }, footerMark: { fontSize: 13, color: colors.accent, marginRight: 7 }, footerText: { color: colors.muted, fontSize: 11 }, localBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' }, localDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent }, localText: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
});
