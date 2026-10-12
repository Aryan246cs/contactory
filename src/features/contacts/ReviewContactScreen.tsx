import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Field } from '@/components/Field';
import { ActionButton } from '@/components/ActionButton';
import { saveContact, getContactById, findPotentialDuplicate, setNativeContactId } from '@/database/repositories/contactsRepository';
import { saveToPhoneContacts } from '@/services/contacts/nativeContacts';
import { colors, radius, spacing } from '@/theme/tokens';
import { emptyParsedContact, type ContactDraft, type ParsedContact } from '@/types/contact';

type ReviewParams = { draft?: string; editId?: string; manual?: string };
const initialDraft = (contact: ParsedContact = emptyParsedContact()): ContactDraft => ({
  ...contact, phones: contact.phones.map((phone) => ({ ...phone })), note: '', meetingDate: '', location: '',
});
function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function ReviewContactScreen() {
  const params = useLocalSearchParams<ReviewParams>();
  const editId = params.editId;
  const scanned = useMemo(() => { try { return params.draft ? JSON.parse(params.draft) as ParsedContact : emptyParsedContact(); } catch { return emptyParsedContact(); } }, [params.draft]);
  const [draft, setDraft] = useState<ContactDraft>(() => initialDraft(scanned));
  const [saveNative, setSaveNative] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (editId) getContactById(editId).then((record) => {
      if (active && record) setDraft({
        fullName: record.fullName, firstName: record.firstName, lastName: record.lastName, company: record.company,
        jobTitle: record.jobTitle, email: record.email, website: record.website, address: record.address,
        phones: record.phones.map((phone) => ({ value: phone.value, label: phone.label, selected: true })),
        note: record.notes[0]?.content ?? '', meetingDate: record.notes[0]?.meetingDate ?? '',
        location: record.notes[0]?.location ?? '',
      });
    }).catch(() => Alert.alert('Contact unavailable', 'This contact could not be loaded.'));
    return () => { active = false; };
  }, [editId]);

  const update = function <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); };
  const setPhone = (index: number, patch: Partial<ContactDraft['phones'][number]>) => setDraft((current) => ({
    ...current, phones: current.phones.map((phone, i) => i === index ? { ...phone, ...patch } : phone),
  }));

  const persist = async (saveAnyway = false) => {
    const hasAny = draft.fullName.trim() || draft.company.trim() || draft.email.trim() || draft.phones.some((phone) => phone.selected && phone.value.trim());
    if (!hasAny) { Alert.alert('Add a contact detail', 'Enter a name, company, email, or choose at least one phone number.'); return; }
    if (draft.meetingDate.trim() && !isValidIsoDate(draft.meetingDate.trim())) { Alert.alert('Check the meeting date', 'Enter a real date in YYYY-MM-DD format.'); return; }
    if (busy) return;
    setBusy(true);
    try {
      let finalDraft = draft;
      if (draft.fullName.trim()) {
        const names = draft.fullName.trim().split(/\s+/);
        finalDraft = { ...draft, firstName: names[0] ?? '', lastName: names.slice(1).join(' ') };
      }
      if (!editId && !saveAnyway) {
        const duplicate = await findPotentialDuplicate(finalDraft.email, finalDraft.phones.filter((phone) => phone.selected).map((phone) => phone.value));
        if (duplicate) {
          setBusy(false);
          Alert.alert('This person may already be in Contactory', `${duplicate.fullName || duplicate.company}${duplicate.company ? `\n${duplicate.company}` : ''}${duplicate.phones[0] ? `\n${duplicate.phones[0].value}` : ''}`, [
            { text: 'View existing', onPress: () => router.push({ pathname: '/contacts/[id]', params: { id: duplicate.id } }) },
            { text: 'Save anyway', onPress: () => { void persist(true); } },
            { text: 'Cancel', style: 'cancel' },
          ]);
          return;
        }
      }
      const id = await saveContact(finalDraft, editId);
      if (saveNative) {
        try { const nativeId = await saveToPhoneContacts(finalDraft); await setNativeContactId(id, nativeId); }
        catch (error) { Alert.alert('Saved to Contactory', error instanceof Error ? error.message : 'Phone contact could not be created.', [{ text: 'Continue', onPress: () => router.replace({ pathname: '/contacts/[id]', params: { id, saved: '1' } }) }]); return; }
      }
      router.replace({ pathname: '/contacts/[id]', params: { id, saved: '1' } });
    } catch (error) {
      Alert.alert('Could not save contact', error instanceof Error ? error.message : 'Try again in a moment.');
    } finally { setBusy(false); }
  };

  return <Screen scroll>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={editId ? 'Edit Contact' : params.manual ? 'Add Contact' : 'Review Contact'} />
      <Text style={styles.intro}>{params.manual ? 'Add the details you want to remember.' : 'We found a few details. Review and adjust them before saving.'}</Text>
      <View style={styles.section}><Text style={styles.sectionTitle}>THE PERSON</Text>
        <Field label="Full name" value={draft.fullName} onChangeText={(v) => update('fullName', v)} placeholder="e.g. Rahul Sharma" autoCapitalize="words" />
        <Field label="Company" value={draft.company} onChangeText={(v) => update('company', v)} placeholder="Company or organization" />
        <Field label="Job title" value={draft.jobTitle} onChangeText={(v) => update('jobTitle', v)} placeholder="Role" />
        <Field label="Email" value={draft.email} onChangeText={(v) => update('email', v)} placeholder="name@company.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Website" value={draft.website} onChangeText={(v) => update('website', v)} placeholder="company.com" autoCapitalize="none" />
        <Field label="Address" value={draft.address} onChangeText={(v) => update('address', v)} placeholder="Address" multiline />
      </View>
      <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>PHONE NUMBERS</Text><Pressable onPress={() => update('phones', [...draft.phones, { value: '', label: 'Phone', selected: true }])}><Text style={styles.add}>+ Add number</Text></Pressable></View>
        {draft.phones.length === 0 ? <Text style={styles.hint}>No number detected. Add one if you have it.</Text> : draft.phones.map((phone, index) => <View key={`${index}-${phone.value}`} style={styles.phoneCard}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: phone.selected }} onPress={() => setPhone(index, { selected: !phone.selected })} style={[styles.check, phone.selected && styles.checked]}><Text style={styles.checkText}>{phone.selected ? '✓' : ''}</Text></Pressable>
          <View style={styles.phoneFields}><Field label="Number" value={phone.value} onChangeText={(v) => setPhone(index, { value: v })} placeholder="Phone number" keyboardType="phone-pad"/><Field label="Label" value={phone.label} onChangeText={(v) => setPhone(index, { label: v })} placeholder="Mobile, Office…" /></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Remove number" onPress={() => update('phones', draft.phones.filter((_, i) => i !== index))}><Text style={styles.remove}>×</Text></Pressable>
        </View>)}
        <Text style={styles.hint}>Choose one, several, all, or none.</Text>
      </View>
      <View style={styles.memory}><Text style={styles.memoryEyebrow}>YOUR MEMORY</Text><Text style={styles.memoryTitle}>What should you remember?</Text><Text style={styles.memoryHelp}>Where you met, what you discussed, or why to follow up.</Text>
        <Field label="A note for later" value={draft.note} onChangeText={(v) => update('note', v)} placeholder="Met at… Discussed… Follow up about…" multiline />
        <Field label="Meeting date (optional)" value={draft.meetingDate ? draft.meetingDate.slice(0, 10) : ''} onChangeText={(v) => update('meetingDate', v)} placeholder="YYYY-MM-DD" />
        <Field label="Where you met (optional)" value={draft.location} onChangeText={(v) => update('location', v)} placeholder="Location" />
      </View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: saveNative }} onPress={() => setSaveNative(!saveNative)} style={styles.nativeRow}><View style={[styles.check, saveNative && styles.checked]}><Text style={styles.checkText}>{saveNative ? '✓' : ''}</Text></View><View style={{ flex: 1 }}><Text style={styles.nativeTitle}>Also save to phone Contacts</Text><Text style={styles.nativeSub}>Your note stays private in Contactory.</Text></View></Pressable>
      <ActionButton title={busy ? 'Saving…' : editId ? 'Save Changes' : 'Save Contact'} disabled={busy} onPress={() => persist()} />
      <View style={{ height: 28 }} />
    </KeyboardAvoidingView>
  </Screen>;
}

const styles = StyleSheet.create({ intro: { color: colors.inkSoft, fontSize: 14, lineHeight: 21, marginBottom: 17 }, section: { marginTop: 12, padding: 16, backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }, sectionTitle: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, add: { color: colors.accent, fontSize: 12, fontWeight: '700' }, phoneCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }, check: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.accent, borderColor: colors.accent }, checkText: { color: colors.paper, fontSize: 14, fontWeight: '800' }, phoneFields: { flex: 1 }, remove: { color: colors.muted, fontSize: 24, padding: 4 }, hint: { color: colors.muted, fontSize: 11, marginTop: 12 }, memory: { padding: 18, backgroundColor: '#E9EDE4', borderRadius: radius.md, marginTop: 14 }, memoryEyebrow: { color: colors.accent, fontSize: 9, letterSpacing: 1.4, fontWeight: '800' }, memoryTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 9 }, memoryHelp: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4 }, nativeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, marginVertical: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.paper }, nativeTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' }, nativeSub: { color: colors.inkSoft, fontSize: 11, marginTop: 3 }, });
