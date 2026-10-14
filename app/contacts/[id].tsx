import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ActionButton } from '@/components/ActionButton';
import { deleteContact, getContactById, setNativeContactId } from '@/database/repositories/contactsRepository';
import { ContactsPermissionError, saveToPhoneContacts } from '@/services/contacts/nativeContacts';
import type { ContactRecord } from '@/types/contact';
import { radius, spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

function displayDate(value: string | null) {
  if (!value) return '';
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function phoneUri(value: string, scheme: 'tel' | 'sms') { return `${scheme}:${value.replace(/[^\d+*#,;]/g, '')}`; }
function initials(contact: ContactRecord) { return (contact.fullName || contact.company).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '•'; }

export default function ContactDetails() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<ContactRecord | null>(null);
  const [savingNative, setSavingNative] = useState(false);
  const load = useCallback(() => {
    let active = true;
    getContactById(id).then((item) => { if (active) setContact(item); }).catch(() => Alert.alert('Could not open contact', 'Try returning to your network and opening it again.'));
    return () => { active = false; };
  }, [id]);
  useFocusEffect(load);

  const launch = async (url: string) => { try { await Linking.openURL(url); } catch { Alert.alert('Unable to open', 'No app is available for this action.'); } };
  const nativeSave = async () => {
    if (!contact) return;
    setSavingNative(true);
    try {
      const nativeId = await saveToPhoneContacts({ ...contact, phones: contact.phones.map((p) => ({ value: p.value, label: p.label, selected: true })), note: contact.notes.map((entry) => entry.content).filter(Boolean).join('\n'), meetingDate: contact.notes[0]?.meetingDate ?? '', location: contact.notes[0]?.location ?? '' });
      await setNativeContactId(contact.id, nativeId);
      setContact({ ...contact, nativeContactId: nativeId });
      Alert.alert('Added to phone Contacts', 'Your contact details and memory were copied to your phone contact. Contactory keeps its own copy too.');
    } catch (error) {
      if (error instanceof ContactsPermissionError) {
        Alert.alert('Phone Contacts permission needed', error.message, [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => { void Linking.openSettings().catch(() => Alert.alert('Settings unavailable', 'Open Contactory in your device settings to allow Contacts access.')); } },
        ]);
      } else {
        Alert.alert('Saved to Contactory', error instanceof Error ? error.message : 'Phone contact could not be created.');
      }
    }
    finally { setSavingNative(false); }
  };
  const askDelete = () => Alert.alert('Delete this contact?', 'This removes the person, their notes, and their group assignments from Contactory. A phone contact is not deleted.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete Contact', style: 'destructive', onPress: async () => { await deleteContact(id); router.replace('/contacts'); } },
  ]);

  if (!contact) return <SafeAreaView style={styles.safe}><ScreenHeader title="Contact" /></SafeAreaView>;
  const note = contact.notes[0];
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader title="Contact" right={<Pressable onPress={() => router.push({ pathname: '/contacts/edit/[id]', params: { id: contact.id } })}><Text style={styles.edit}>Edit</Text></Pressable>} />
      <View style={styles.hero}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(contact)}</Text></View><Text style={styles.name}>{contact.fullName || contact.company || 'Unnamed contact'}</Text><Text style={styles.role}>{contact.jobTitle}</Text><Text style={styles.company}>{contact.company}</Text></View>
      <View style={styles.actions}>
        {contact.phones[0] && <Pressable style={styles.action} onPress={() => launch(phoneUri(contact.phones[0].value, 'tel'))}><Text style={styles.actionIcon}>↗</Text><Text style={styles.actionText}>Call</Text></Pressable>}
        {contact.phones[0] && <Pressable style={styles.action} onPress={() => launch(phoneUri(contact.phones[0].value, 'sms'))}><Text style={styles.actionIcon}>···</Text><Text style={styles.actionText}>Message</Text></Pressable>}
        {contact.email && <Pressable style={styles.action} onPress={() => launch(`mailto:${contact.email}`)}><Text style={styles.actionIcon}>✉</Text><Text style={styles.actionText}>Email</Text></Pressable>}
      </View>
      <View style={styles.card}><Text style={styles.eyebrow}>CONTACT DETAILS</Text>
        {contact.phones.map((phone) => <Pressable key={phone.id} onPress={() => launch(phoneUri(phone.value, 'tel'))} style={styles.detail}><Text style={styles.detailIcon}>◦</Text><View style={{ flex: 1 }}><Text style={styles.detailValue}>{phone.value}</Text><Text style={styles.detailLabel}>{phone.label}</Text></View></Pressable>)}
        {contact.email ? <Pressable onPress={() => launch(`mailto:${contact.email}`)} style={styles.detail}><Text style={styles.detailIcon}>◦</Text><View><Text style={styles.detailValue}>{contact.email}</Text><Text style={styles.detailLabel}>EMAIL</Text></View></Pressable> : null}
        {contact.website ? <Pressable onPress={() => launch(contact.website.startsWith('http') ? contact.website : `https://${contact.website}`)} style={styles.detail}><Text style={styles.detailIcon}>◦</Text><View><Text style={styles.detailValue}>{contact.website}</Text><Text style={styles.detailLabel}>WEBSITE</Text></View></Pressable> : null}
        {contact.address ? <View style={styles.detail}><Text style={styles.detailIcon}>◦</Text><Text style={styles.detailValue}>{contact.address}</Text></View> : null}
      </View>
      <View style={styles.memory}><Text style={styles.eyebrow}>YOUR MEMORY</Text>
        {note?.location ? <Text style={styles.location}>MET AT  ·  {note.location.toUpperCase()}</Text> : null}
        {note?.content ? <Text style={styles.note}>{note.content}</Text> : <Text style={styles.noNote}>Add a note about where you met or what you talked about.</Text>}
        {note?.meetingDate ? <Text style={styles.date}>{displayDate(note.meetingDate)}</Text> : null}
        <Pressable onPress={() => router.push({ pathname: '/contacts/edit/[id]', params: { id: contact.id } })}><Text style={styles.memoryEdit}>{note?.content ? 'Edit your memory  →' : 'Add a memory  →'}</Text></Pressable>
      </View>
      {contact.tags.length > 0 ? <View style={styles.tags}><Text style={styles.eyebrow}>GROUPS</Text><View style={styles.tagList}>{contact.tags.map((tag) => <Pressable key={tag.id} onPress={() => router.push({ pathname: '/groups/[id]' as never, params: { id: tag.id, name: tag.name } })} style={styles.tag}><Text style={styles.tagText}># {tag.name}</Text></Pressable>)}</View></View> : null}
      <View style={styles.phoneStatus}><Text style={styles.phoneStatusTitle}>{contact.nativeContactId ? '✓  Added to phone Contacts' : 'Saved privately in Contactory'}</Text><Text style={styles.phoneStatusSub}>{contact.nativeContactId ? 'Contactory keeps a copy of your memory too.' : 'Your contact and memory are stored on this device.'}</Text>
        {!contact.nativeContactId && <ActionButton title={savingNative ? 'Adding…' : 'Save to Phone Contacts'} variant="secondary" disabled={savingNative} onPress={nativeSave} />}
      </View>
      <View style={styles.nextActions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back to home" onPress={() => router.replace('/')} style={({ pressed }) => [styles.nextAction, styles.homeAction, pressed && styles.nextActionPressed]}>
          <Text style={styles.homeActionText}>Go to Home</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Scan another card" onPress={() => router.replace('/scan')} style={({ pressed }) => [styles.nextAction, styles.scanAction, pressed && styles.nextActionPressed]}>
          <Text style={styles.scanActionText}>Scan Another Card</Text>
        </Pressable>
      </View>
      <Pressable onPress={askDelete} style={styles.delete}><Text style={styles.deleteText}>Delete from Contactory</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { paddingHorizontal: spacing.xl, paddingBottom: 30 }, edit: { color: colors.accent, fontWeight: '700', fontSize: 13 }, hero: { alignItems: 'center', paddingVertical: 20 }, avatar: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontWeight: '800', fontSize: 22 }, name: { color: colors.ink, fontSize: 27, fontWeight: '700', letterSpacing: -1, marginTop: 15, textAlign: 'center' }, role: { color: colors.inkSoft, fontSize: 14, marginTop: 5 }, company: { color: colors.accent, fontWeight: '700', fontSize: 12, marginTop: 6, letterSpacing: 0.4 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 13, marginBottom: 18 }, action: { backgroundColor: colors.accentSoft, borderRadius: radius.sm, width: 84, height: 67, alignItems: 'center', justifyContent: 'center', gap: 3 }, actionIcon: { fontSize: 19, color: colors.accent, fontWeight: '700' }, actionText: { fontSize: 11, color: colors.ink, fontWeight: '600' }, card: { padding: 17, backgroundColor: colors.paper, borderRadius: radius.md, borderColor: colors.border, borderWidth: 1, elevation: 3, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }, eyebrow: { fontSize: 9, color: colors.accent, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }, detail: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }, detailIcon: { color: colors.accent, fontSize: 21 }, detailValue: { color: colors.ink, fontSize: 14, lineHeight: 19 }, detailLabel: { color: colors.muted, fontSize: 9, marginTop: 3, letterSpacing: 0.9, fontWeight: '700' }, memory: { padding: 19, borderRadius: radius.md, backgroundColor: colors.memory, marginTop: 16, borderWidth: 1, borderColor: colors.border, elevation: 2, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, tags: { padding: 17, borderRadius: radius.md, backgroundColor: colors.paper, marginTop: 12, borderWidth: 1, borderColor: colors.border }, tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, tag: { backgroundColor: colors.accentSoft, paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill }, tagText: { color: colors.accent, fontSize: 11, fontWeight: '700' }, location: { color: colors.accent, fontSize: 9, letterSpacing: 0.9, fontWeight: '800', marginTop: 8 }, note: { color: colors.ink, fontSize: 15, lineHeight: 23, marginTop: 8 }, noNote: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 8 }, date: { color: colors.muted, fontSize: 11, marginTop: 13 }, memoryEdit: { color: colors.accent, fontSize: 12, fontWeight: '700', marginTop: 14 }, phoneStatus: { padding: 16, backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 16, gap: 7 }, phoneStatusTitle: { color: colors.ink, fontWeight: '700', fontSize: 13 }, phoneStatusSub: { color: colors.inkSoft, fontSize: 11, lineHeight: 17, marginBottom: 7 }, nextActions: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 2 }, nextAction: { flex: 1, minHeight: 43, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, borderWidth: 1 }, homeAction: { backgroundColor: colors.paper, borderColor: colors.border }, scanAction: { backgroundColor: colors.accentFill, borderColor: colors.accentFill }, homeActionText: { color: colors.ink, fontSize: 11, fontWeight: '700' }, scanActionText: { color: colors.onAccent, fontSize: 11, fontWeight: '700' }, nextActionPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] }, delete: { padding: 16, alignItems: 'center', marginTop: 10 }, deleteText: { color: colors.destructive, fontSize: 13, fontWeight: '700' } });
