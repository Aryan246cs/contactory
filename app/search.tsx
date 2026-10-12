import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchContacts } from '@/database/repositories/contactsRepository';
import type { ContactRecord } from '@/types/contact';
import { colors, radius, spacing } from '@/theme/tokens';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) { setResults([]); setSearched(false); return; }
      setLoading(true);
      searchContacts(query).then(setResults).catch(() => setResults([])).finally(() => { setLoading(false); setSearched(true); });
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  return <SafeAreaView style={styles.safe}>
    <View style={styles.top}><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.title}>Search your memory</Text></View>
    <View style={styles.search}><Text style={styles.searchGlyph}>⌕</Text><TextInput autoFocus placeholder="Name, company, phone, or a memory" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={styles.input} returnKeyType="search"/><Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')}><Text style={styles.clear}>{query ? '×' : ''}</Text></Pressable></View>
    {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 36 }} /> : !query.trim() ? <View style={styles.center}><Text style={styles.centerGlyph}>⌕</Text><Text style={styles.centerTitle}>A name isn’t the only way.</Text><Text style={styles.centerText}>Search for where you met, what you discussed, or a detail you remember.</Text></View> : results.length ? <FlatList data={results} keyExtractor={(item) => item.id} keyboardShouldPersistTaps="handled" renderItem={({ item }) => {
      const initials = (item.fullName || item.company).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '•';
      const snippet = item.notes[0]?.content || item.notes[0]?.location || item.jobTitle;
      return <Pressable onPress={() => router.push({ pathname: '/contacts/[id]', params: { id: item.id } })} style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{item.fullName || item.company}</Text><Text style={styles.company}>{item.company || item.jobTitle || item.email}</Text>{snippet ? <Text style={styles.snippet} numberOfLines={2}>{snippet}</Text> : null}</View><Text style={styles.chevron}>›</Text></Pressable>;
    }} contentContainerStyle={{ paddingBottom: 24 }} /> : searched ? <View style={styles.center}><Text style={styles.centerGlyph}>◌</Text><Text style={styles.centerTitle}>No connection found.</Text><Text style={styles.centerText}>Try another name, company, phone number, or phrase.</Text></View> : null}
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas, paddingHorizontal: spacing.xl }, top: { flexDirection: 'row', alignItems: 'center', height: 64, gap: 12 }, back: { width: 37, height: 37, borderRadius: 19, backgroundColor: colors.artboard, alignItems: 'center', justifyContent: 'center' }, backText: { fontSize: 30, color: colors.ink, lineHeight: 34, marginTop: -4 }, title: { color: colors.ink, fontSize: 20, fontWeight: '700', letterSpacing: -0.5 }, search: { height: 53, borderRadius: radius.sm, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9, marginTop: 8, marginBottom: 12 }, searchGlyph: { color: colors.muted, fontSize: 24 }, input: { flex: 1, color: colors.ink, fontSize: 14, paddingVertical: 8 }, clear: { color: colors.muted, fontSize: 22, width: 25, textAlign: 'center' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }, centerGlyph: { color: colors.accent, fontSize: 34 }, centerTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 13 }, centerText: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 }, row: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomColor: colors.border, borderBottomWidth: 1 }, avatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontWeight: '800' }, name: { color: colors.ink, fontSize: 14, fontWeight: '700' }, company: { color: colors.inkSoft, fontSize: 11, marginTop: 3 }, snippet: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }, chevron: { color: colors.muted, fontSize: 23 } });
