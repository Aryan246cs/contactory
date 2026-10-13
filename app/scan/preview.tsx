import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { File } from 'expo-file-system';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ActionButton } from '@/components/ActionButton';
import { recognizeTextFromImage } from '@/services/ocr/recognizeText';
import { extractContactFields } from '@/services/ocr/contactParser';
import { radius, spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { emptyParsedContact } from '@/types/contact';

export default function CardPreview() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { uri, source } = useLocalSearchParams<{ uri?: string; source?: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const clearCapturedImage = () => {
    if (source !== 'camera' || !uri) return;
    try { const file = new File(uri); if (file.exists) file.delete(); } catch { /* cache cleanup is best-effort */ }
  };
  useEffect(() => () => clearCapturedImage(), [uri, source]);

  const readCard = async () => {
    if (!uri) { setError('This photo could not be opened. Try choosing it again.'); return; }
    setBusy(true); setError('');
    try {
      const result = await recognizeTextFromImage(uri);
      if (!result.text.trim()) throw new Error('We could not find readable text on this card. Try a brighter, sharper photo or enter the details manually.');
      const parsed = result.text.trim() ? extractContactFields(result.text) : emptyParsedContact();
      clearCapturedImage();
      router.push({ pathname: '/scan/review', params: { draft: JSON.stringify({ ...parsed, note: '', meetingDate: '', location: '', rawOcrText: result.text }) } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Card reading failed. You can still enter the details manually.');
    } finally { setBusy(false); }
  };

  return <SafeAreaView style={styles.safe}>
    <View style={styles.content}>
      <ScreenHeader title="Check your card" />
      <Text style={styles.lead}>A clear photo helps us find the details.</Text>
      {uri && !imageLoadFailed ? <Image source={{ uri }} style={styles.image} resizeMode="contain" onError={() => setImageLoadFailed(true)} /> : <View style={styles.broken}><Text style={styles.errorText}>Photo preview unavailable. Go back and take or choose the photo again.</Text></View>}
      {busy ? <View style={styles.processing}><ActivityIndicator color={colors.accent} /><Text style={styles.processTitle}>Reading your card…</Text><Text style={styles.processSub}>Finding contact details on this device.</Text></View> : error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => { clearCapturedImage(); router.push({ pathname: '/contacts/new', params: { manual: '1' } }); }}><Text style={styles.manualLink}>Enter details manually  →</Text></Pressable></View> : <View style={styles.tips}><Text style={styles.tipMark}>✳</Text><Text style={styles.tipText}>We’ll extract what we can. You’ll review and edit everything before saving.</Text></View>}
      <View style={styles.actions}><ActionButton title={busy ? 'Reading card…' : 'Read this card'} disabled={busy || !uri || imageLoadFailed} onPress={readCard} /><Pressable style={styles.retake} onPress={() => router.back()}><Text style={styles.retakeText}>Retake photo</Text></Pressable></View>
    </View>
  </SafeAreaView>;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: 18 }, lead: { color: colors.inkSoft, fontSize: 14, marginBottom: 14 }, image: { width: '100%', flex: 1, maxHeight: '56%', minHeight: 180, borderRadius: radius.md, backgroundColor: colors.artboard }, broken: { flex: 1, minHeight: 180, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.artboard, borderRadius: radius.md }, tips: { flexDirection: 'row', gap: 10, marginTop: 17, alignItems: 'flex-start' }, tipMark: { color: colors.accent, fontSize: 16 }, tipText: { flex: 1, color: colors.inkSoft, fontSize: 12, lineHeight: 18 }, actions: { marginTop: 'auto', paddingTop: 18, gap: 12 }, retake: { height: 42, alignItems: 'center', justifyContent: 'center' }, retakeText: { color: colors.inkSoft, fontSize: 14, fontWeight: '600' }, processing: { alignItems: 'center', padding: 22, gap: 6 }, processTitle: { color: colors.ink, fontWeight: '700', fontSize: 15 }, processSub: { color: colors.inkSoft, fontSize: 12, textAlign: 'center' }, errorBox: { marginTop: 16, padding: 14, borderRadius: radius.sm, backgroundColor: colors.overlay }, errorText: { color: colors.destructive, fontSize: 13, lineHeight: 19, textAlign: 'center' }, manualLink: { color: colors.accent, textAlign: 'center', marginTop: 11, fontSize: 13, fontWeight: '700' } });
