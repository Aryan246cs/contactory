import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export default function PrivacyDraft() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><ScreenHeader title="Privacy policy draft" />
    <Text style={styles.date}>DRAFT · 13 OCTOBER 2026</Text>
    <Text style={styles.heading}>Your contacts stay yours.</Text>
    <Text style={styles.body}>Contactory is designed to store your network on your device. This draft reflects the current local-first implementation and must be reviewed before public release.</Text>
    <Text style={styles.subhead}>Information you add</Text><Text style={styles.body}>Contact names, companies, job titles, phone numbers, email addresses, websites, addresses, personal notes, and tags are stored in the Contactory app’s local SQLite database. Card images and raw OCR text are temporary and are not retained after review. There is no card image history or Contactory cloud storage.</Text>
    <Text style={styles.subhead}>Scanning</Text><Text style={styles.body}>Card images are processed on the device by Apple Vision on iOS and Google ML Kit on Android. Contactory does not send card images or extracted contact information to a server for OCR.</Text>
    <Text style={styles.subhead}>Phone Contacts</Text><Text style={styles.body}>If you leave “Also save to phone Contacts” selected, Contactory copies the contact details and memory note to the device Contacts system. The note may appear in the phone contact’s Notes field and can sync with that account, such as Google Contacts. This is a separate copy; Contactory also keeps the contact and note in its local database.</Text>
    <Text style={styles.subhead}>Sharing and export</Text><Text style={styles.body}>When you export a CSV, the operating system’s share sheet lets you choose where the file goes. Contactory does not upload the export.</Text>
    <Text style={styles.subhead}>Network and third parties</Text><Text style={styles.body}>This MVP has no account, cloud backup, analytics SDK, advertising SDK, or automatic data upload configured. No third-party sharing is built into the contact workflow.</Text>
    <Text style={styles.subhead}>Your choices</Text><Text style={styles.body}>You can edit or delete local Contactory records and export them. Deleting local data does not delete entries already saved to your phone’s Contacts.</Text>
    <Text style={styles.disclaimer}>This is a product draft, not legal advice. Add publisher identity, support contact, jurisdiction-specific terms, and a reviewed effective date before release.</Text>
  </ScrollView></SafeAreaView>;
}
const makeStyles = (colors: ThemeColors) => StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { paddingHorizontal: spacing.xl, paddingBottom: 35 }, date: { color: colors.accent, fontSize: 9, letterSpacing: 1.2, fontWeight: '800', marginTop: 5 }, heading: { color: colors.ink, fontSize: 28, lineHeight: 33, fontWeight: '700', letterSpacing: -1, marginTop: 12 }, body: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 8 }, subhead: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 21 }, disclaimer: { color: colors.warning, fontSize: 11, lineHeight: 17, marginTop: 24, padding: 13, backgroundColor: colors.overlay, borderRadius: 9 } });
