import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '@/components/ScreenHeader';
import { exportContactsCsv } from '@/services/export/exportContacts';
import { deleteAllLocalData } from '@/database/repositories/contactsRepository';
import { colors, radius, spacing } from '@/theme/tokens';

export default function SettingsScreen() {
  const [exporting, setExporting] = useState(false);
  const exportData = async () => {
    setExporting(true);
    try { await exportContactsCsv(); }
    catch (error) { Alert.alert('Could not export contacts', error instanceof Error ? error.message : 'Try again in a moment.'); }
    finally { setExporting(false); }
  };
  const deleteData = () => Alert.alert('Delete everything?', 'This permanently removes your Contactory contacts, notes, and stored card records from this device. This cannot be undone. Your phone Contacts will not be changed.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete Everything', style: 'destructive', onPress: async () => {
      try { await deleteAllLocalData(); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Local data deleted', 'Your phone Contacts were not changed.', [{ text: 'Done', onPress: () => router.replace('/') }]); }
      catch { Alert.alert('Could not delete data', 'Try again in a moment.'); }
    } },
  ]);
  const openSettings = () => Linking.openSettings().catch(() => Alert.alert('Settings unavailable', 'Open Contactory from your device settings to change permissions.'));

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader title="Settings" />
      <View style={styles.brand}><Text style={styles.brandName}>Contactory</Text><Text style={styles.tagline}>Every card has a story. Remember yours.</Text></View>
      <Text style={styles.section}>APPEARANCE</Text>
      <View style={styles.card}><Text style={styles.itemTitle}>Light appearance</Text><Text style={styles.itemSub}>Dark appearance and system theme support are planned for a follow-up polish pass.</Text></View>
      <Text style={styles.section}>PERMISSIONS</Text>
      <Pressable onPress={openSettings} style={styles.row}><View><Text style={styles.itemTitle}>Camera</Text><Text style={styles.itemSub}>Requested when you choose Scan Card.</Text></View><Text style={styles.chevron}>›</Text></Pressable>
      <Pressable onPress={openSettings} style={styles.row}><View><Text style={styles.itemTitle}>Phone Contacts</Text><Text style={styles.itemSub}>Requested only when you save to phone contacts.</Text></View><Text style={styles.chevron}>›</Text></Pressable>
      <Text style={styles.section}>YOUR DATA</Text>
      <Pressable accessibilityRole="button" onPress={exportData} disabled={exporting} style={styles.row}><View><Text style={styles.itemTitle}>{exporting ? 'Preparing export…' : 'Export contacts as CSV'}</Text><Text style={styles.itemSub}>Create a file and choose where to share or save it.</Text></View><Text style={styles.chevron}>↗</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={deleteData} style={[styles.row, styles.deleteRow]}><View><Text style={styles.deleteTitle}>Delete all local data</Text><Text style={styles.itemSub}>Your phone Contacts are left untouched.</Text></View><Text style={styles.chevron}>›</Text></Pressable>
      <Text style={styles.section}>PRIVACY & ABOUT</Text>
      <Pressable onPress={() => router.push('/privacy')} style={styles.row}><View><Text style={styles.itemTitle}>Privacy policy</Text><Text style={styles.itemSub}>A draft describing this local-first version.</Text></View><Text style={styles.chevron}>›</Text></Pressable>
      <View style={styles.about}><Text style={styles.version}>Contactory · Version 1.0.0</Text><Text style={styles.aboutSub}>Your network, held close.</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { paddingHorizontal: spacing.xl, paddingBottom: 35 }, brand: { marginTop: 8, marginBottom: 18 }, brandName: { color: colors.ink, fontSize: 29, letterSpacing: -1, fontWeight: '700' }, tagline: { color: colors.inkSoft, fontSize: 13, marginTop: 4 }, section: { color: colors.accent, fontSize: 9, letterSpacing: 1.5, fontWeight: '800', marginTop: 22, marginBottom: 8 }, card: { padding: 15, backgroundColor: colors.paper, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border }, row: { minHeight: 64, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.paper, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, marginBottom: 7 }, itemTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' }, itemSub: { color: colors.inkSoft, fontSize: 10, lineHeight: 15, marginTop: 4, maxWidth: 275 }, chevron: { color: colors.muted, fontSize: 20, marginLeft: 8 }, deleteRow: { borderColor: '#E8D6D1' }, deleteTitle: { color: colors.destructive, fontSize: 13, fontWeight: '700' }, about: { alignItems: 'center', paddingTop: 26 }, version: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' }, aboutSub: { color: colors.muted, fontSize: 10, marginTop: 5 } });
