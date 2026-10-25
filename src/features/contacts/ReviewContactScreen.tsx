import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Field } from '@/components/Field';
import { ActionButton } from '@/components/ActionButton';
import { saveContact, getContactById, findPotentialDuplicate, setNativeContactId, listTags, setContactTags } from '@/database/repositories/contactsRepository';
import { ContactsPermissionError, saveToPhoneContacts } from '@/services/contacts/nativeContacts';
import { radius, spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { emptyParsedContact, type ContactDraft, type ParsedContact } from '@/types/contact';

type ReviewParams = { draft?: string; editId?: string; id?: string; manual?: string };
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
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const params = useLocalSearchParams<ReviewParams>();
  const editId = params.editId ?? params.id;
  const scanned = useMemo(() => { try { return params.draft ? JSON.parse(params.draft) as ParsedContact : emptyParsedContact(); } catch { return emptyParsedContact(); } }, [params.draft]);
  const [draft, setDraft] = useState<ContactDraft>(() => initialDraft(scanned));
  const [saveNative, setSaveNative] = useState(true);
  const [nativeContactId, setNativeContactIdState] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; kind: string }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => { const today = new Date(); return new Date(today.getFullYear(), today.getMonth(), 1); });

  useFocusEffect(useCallback(() => { let active = true; listTags().then((items) => { if (active) setAvailableTags(items); }).catch(() => { if (active) setAvailableTags([]); }); return () => { active = false; }; }, []));

  useEffect(() => {
    let active = true;
    if (editId) {
      setLoadingEdit(true);
      getContactById(editId).then((record) => {
        if (!active) return;
        if (!record) {
          Alert.alert('Contact unavailable', 'This contact could not be loaded.', [{ text: 'Go back', onPress: () => router.back() }]);
          return;
        }
        setDraft({
          fullName: record.fullName, firstName: record.firstName, lastName: record.lastName, company: record.company,
          jobTitle: record.jobTitle, email: record.email, website: record.website, address: record.address,
          phones: record.phones.map((phone) => ({ value: phone.value, label: phone.label, selected: true })),
          note: record.notes[0]?.content ?? '', meetingDate: record.notes[0]?.meetingDate ?? '',
          location: record.notes[0]?.location ?? '',
        });
        setNativeContactIdState(record.nativeContactId);
        setSelectedTags(record.tags.map((tag) => tag.id));
      }).catch(() => {
        if (active) Alert.alert('Contact unavailable', 'This contact could not be loaded.');
      }).finally(() => { if (active) setLoadingEdit(false); });
    }
    return () => { active = false; };
  }, [editId]);

  const update = function <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); };
  const setPhone = (index: number, patch: Partial<ContactDraft['phones'][number]>) => setDraft((current) => ({
    ...current, phones: current.phones.map((phone, i) => i === index ? { ...phone, ...patch } : phone),
  }));
  const monthDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const count = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    return [...Array(first.getDay()).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [calendarMonth]);
  const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const chooseDate = (date: Date) => { update('meetingDate', isoDate(date)); setCalendarOpen(false); };

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
          Alert.alert('This person may already be in Vemori', `${duplicate.fullName || duplicate.company}${duplicate.company ? `\n${duplicate.company}` : ''}${duplicate.phones[0] ? `\n${duplicate.phones[0].value}` : ''}`, [
            { text: 'View existing', onPress: () => router.push({ pathname: '/contacts/[id]', params: { id: duplicate.id } }) },
            { text: 'Save anyway', onPress: () => { void persist(true); } },
            { text: 'Cancel', style: 'cancel' },
          ]);
          return;
        }
      }
      const id = await saveContact(finalDraft, editId);
      await setContactTags(id, selectedTags);
      if (saveNative) {
        try { const nativeId = await saveToPhoneContacts(finalDraft, nativeContactId); await setNativeContactId(id, nativeId); }
        catch (error) {
          const details = { pathname: '/contacts/[id]' as const, params: { id, saved: '1' } };
          if (error instanceof ContactsPermissionError) {
            Alert.alert('Saved to Vemori', error.message, [
              { text: 'Later', style: 'cancel', onPress: () => router.replace(details) },
              { text: 'Open Settings', onPress: () => { router.replace(details); void Linking.openSettings().catch(() => Alert.alert('Settings unavailable', 'Open Vemori in your device settings to allow Contacts access.')); } },
            ]);
          } else {
            Alert.alert('Saved to Vemori', error instanceof Error ? error.message : 'Phone contact could not be created.', [{ text: 'Continue', onPress: () => router.replace(details) }]);
          }
          return;
        }
      }
      router.replace({ pathname: '/contacts/[id]', params: { id, saved: '1' } });
    } catch (error) {
      Alert.alert('Could not save contact', error instanceof Error ? error.message : 'Try again in a moment.');
    } finally { setBusy(false); }
  };

  if (loadingEdit) return <Screen><ScreenHeader title="Edit Contact" /><ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} /></Screen>;

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
        <View style={styles.dateWrap}><Text style={styles.dateLabel}>Meeting date (optional)</Text><Pressable accessibilityRole="button" accessibilityLabel="Choose meeting date" onPress={() => setCalendarOpen((open) => !open)} style={styles.dateButton}><Text style={[styles.dateValue, !draft.meetingDate && styles.datePlaceholder]}>{draft.meetingDate || 'Choose a date'}</Text><Text style={styles.calendarIcon}>▦</Text></Pressable></View>
        {calendarOpen ? <View style={styles.calendar}><View style={styles.calendarHead}><Pressable accessibilityLabel="Previous month" onPress={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><Text style={styles.monthArrow}>‹</Text></Pressable><Text style={styles.monthTitle}>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityLabel="Next month" onPress={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><Text style={styles.monthArrow}>›</Text></Pressable></View><View style={styles.calendarGrid}>{['S','M','T','W','T','F','S'].map((day, i) => <Text key={`${day}-${i}`} style={styles.weekday}>{day}</Text>)}{monthDays.map((day, i) => day ? <Pressable key={i} accessibilityRole="button" accessibilityLabel={`${calendarMonth.toLocaleDateString(undefined, { month: 'long' })} ${day}`} onPress={() => chooseDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))} style={[styles.dayCell, draft.meetingDate === isoDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)) && styles.daySelected]}><Text style={[styles.dayText, draft.meetingDate === isoDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)) && styles.dayTextSelected]}>{day}</Text></Pressable> : <View key={`blank-${i}`} style={styles.dayCell} />)}</View><Pressable style={styles.todayButton} onPress={() => { const today = new Date(); setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); chooseDate(today); }}><Text style={styles.todayText}>Today</Text></Pressable></View> : null}
        <Field label="Where you met (optional)" value={draft.location} onChangeText={(v) => update('location', v)} placeholder="Location" />
      </View>
      <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>TAGS</Text><Pressable onPress={() => router.push('/tags' as never)}><Text style={styles.add}>Manage tags  ↗</Text></Pressable></View><Text style={styles.hint}>Optional. Choose a few to group this person in your network.</Text><View style={styles.tagList}>{availableTags.map((tag) => { const selected = selectedTags.includes(tag.id); return <Pressable key={tag.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setSelectedTags((items) => selected ? items.filter((id) => id !== tag.id) : [...items, tag.id])} style={[styles.tagChip, selected && styles.tagChipSelected]}><Text style={[styles.tagText, selected && styles.tagTextSelected]}>{selected ? '✓  ' : '+  '}{tag.name}</Text></Pressable>; })}</View></View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: saveNative }} onPress={() => setSaveNative(!saveNative)} style={styles.nativeRow}><View style={[styles.check, saveNative && styles.checked]}><Text style={styles.checkText}>{saveNative ? '✓' : ''}</Text></View><View style={{ flex: 1 }}><Text style={styles.nativeTitle}>Also save to phone Contacts</Text><Text style={styles.nativeSub}>Your memory will be copied to its Notes field too.</Text></View></Pressable>
      <ActionButton title={busy ? 'Saving…' : editId ? 'Save Changes' : 'Save Contact'} disabled={busy || loadingEdit} onPress={() => persist()} />
      <View style={{ height: 28 }} />
    </KeyboardAvoidingView>
  </Screen>;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({ intro: { color: colors.inkSoft, fontSize: 14, lineHeight: 21, marginBottom: 17 }, section: { marginTop: 12, padding: 16, backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, elevation: 2, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, sectionTitle: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, add: { color: colors.accent, fontSize: 12, fontWeight: '700' }, phoneCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }, check: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.accentFill, borderColor: colors.accent }, checkText: { color: colors.onAccent, fontSize: 14, fontWeight: '800' }, phoneFields: { flex: 1 }, remove: { color: colors.muted, fontSize: 24, padding: 4 }, hint: { color: colors.muted, fontSize: 11, marginTop: 12 }, memory: { padding: 18, backgroundColor: colors.memory, borderRadius: radius.md, marginTop: 14, borderWidth: 1, borderColor: colors.border, elevation: 2, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, memoryEyebrow: { color: colors.accent, fontSize: 9, letterSpacing: 1.4, fontWeight: '800' }, memoryTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 9 }, memoryHelp: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4 }, dateWrap: { marginTop: 14 }, dateLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: '700', marginBottom: 7 }, dateButton: { minHeight: 49, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.input }, dateValue: { color: colors.ink, fontSize: 15 }, datePlaceholder: { color: colors.muted }, calendarIcon: { color: colors.accent, fontSize: 18 }, calendar: { marginTop: 10, padding: 13, borderRadius: radius.sm, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border }, calendarHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, monthArrow: { fontSize: 28, color: colors.accent, paddingHorizontal: 10 }, monthTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.285%', textAlign: 'center', color: colors.muted, fontSize: 11, fontWeight: '700', paddingVertical: 7 }, dayCell: { width: '14.285%', height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 }, dayText: { color: colors.ink, fontSize: 13 }, daySelected: { backgroundColor: colors.accent }, dayTextSelected: { color: colors.onAccent, fontWeight: '700' }, todayButton: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 7, marginTop: 5 }, todayText: { color: colors.accent, fontWeight: '700', fontSize: 12 }, nativeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, marginVertical: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.paper }, nativeTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' }, nativeSub: { color: colors.inkSoft, fontSize: 11, marginTop: 3 }, tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, tagChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.artboard, borderWidth: 1, borderColor: colors.border }, tagChipSelected: { backgroundColor: colors.accentFill, borderColor: colors.accentFill }, tagText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' }, tagTextSelected: { color: colors.onAccent } });
