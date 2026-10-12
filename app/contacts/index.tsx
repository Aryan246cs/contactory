import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listContacts } from '@/database/repositories/contactsRepository';
import type { ContactRecord } from '@/types/contact';
import { colors, radius, spacing } from '@/theme/tokens';

function initials(contact: ContactRecord) {
  const words = (contact.fullName || contact.company).trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || '•';
}

export default function ContactLibrary() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    listContacts().then((items) => { if (active) setContacts(items); }).catch(() => { if (active) setContacts([]); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><View><Text style={styles.kicker}>THE PEOPLE YOU KEEP</Text><Text style={styles.title}>Your network</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Add a contact" onPress={() => router.push({ pathname: '/contacts/new', params: { manual: '1' } })} style={styles.add}><Text style={styles.addText}>＋</Text></Pressable></View>
    <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={styles.search}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>Search names, companies, memories</Text></Pressable>
    {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : contacts.length === 0 ? <View style={styles.empty}><Text style={styles.emptyGlyph}>✳</Text><Text style={styles.emptyTitle}>Your network is empty.</Text><Text style={styles.emptyText}>The next person you meet could be the beginning.</Text><Pressable onPress={() => router.push('/scan')} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Scan Card</Text></Pressable><Pressable onPress={() => router.push({ pathname: '/contacts/new', params: { manual: '1' } })}><Text style={styles.manual}>Add a contact manually</Text></Pressable></View> : <FlatList data={contacts} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" renderItem={({ item }) => {
      const note = item.notes[0]?.content || item.notes[0]?.location || '';
      return <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/contacts/[id]', params: { id: item.id } })} style={styles.row}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials(item)}</Text></View>
        <View style={styles.rowContent}><Text style={styles.name} numberOfLines={1}>{item.fullName || item.company || 'Unnamed contact'}</Text><Text style={styles.company} numberOfLines={1}>{[item.company, item.jobTitle].filter(Boolean).join(' · ') || item.email || item.phones[0]?.value || 'Contact'}</Text>{note ? <Text style={styles.note} numberOfLines={1}>“{note}”</Text> : null}</View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>;
    }} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas, paddingHorizontal: spacing.xl }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 19 }, kicker: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.6 }, title: { color: colors.ink, fontSize: 31, fontWeight: '700', letterSpacing: -1.3, marginTop: 5 }, add: { width: 43, height: 43, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }, addText: { color: colors.paper, fontSize: 23, lineHeight: 26 }, search: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, marginBottom: 10 }, searchIcon: { color: colors.muted, fontSize: 23 }, searchText: { color: colors.muted, fontSize: 13 }, list: { paddingBottom: 24 }, row: { minHeight: 79, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 13 }, avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontSize: 14, fontWeight: '800' }, rowContent: { flex: 1 }, name: { color: colors.ink, fontSize: 14, fontWeight: '700' }, company: { color: colors.inkSoft, fontSize: 11, marginTop: 4 }, note: { color: colors.muted, fontSize: 10, marginTop: 5 }, chevron: { color: colors.muted, fontSize: 24 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }, emptyGlyph: { color: colors.accent, fontSize: 29 }, emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: 12 }, emptyText: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 }, emptyButton: { marginTop: 21, backgroundColor: colors.accent, paddingHorizontal: 36, paddingVertical: 14, borderRadius: radius.pill }, emptyButtonText: { color: colors.paper, fontSize: 14, fontWeight: '700' }, manual: { color: colors.accent, marginTop: 16, fontSize: 12, fontWeight: '700' } });
