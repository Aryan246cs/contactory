import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CameraView as CameraViewType } from 'expo-camera';
import { File } from 'expo-file-system';
import { cropPhotoToGuide, type ScreenRect } from '@/services/images/cropToGuide';
import { radius, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

function measureRect(view: View | null): Promise<ScreenRect> {
  return new Promise((resolve, reject) => {
    if (!view) { reject(new Error('Camera guide is not ready.')); return; }
    view.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) { reject(new Error('Camera guide has no visible area.')); return; }
      resolve({ x, y, width, height });
    });
  });
}

export default function ScanScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const camera = useRef<CameraViewType>(null);
  const cameraArea = useRef<View>(null);
  const guide = useRef<View>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [taking, setTaking] = useState(false);
  const [flash, setFlash] = useState(false);

  const capture = async () => {
    if (!camera.current || !ready || taking) return;
    setTaking(true);
    let capturedUri: string | undefined;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await camera.current.takePictureAsync({ quality: 0.95 });
      if (!photo?.uri) throw new Error('Camera did not return an image.');
      capturedUri = photo.uri;
      const [cameraRect, guideRect] = await Promise.all([measureRect(cameraArea.current), measureRect(guide.current)]);
      const cropped = await cropPhotoToGuide(photo.uri, photo.width, photo.height, cameraRect, guideRect);
      try { const original = new File(photo.uri); if (original.exists) original.delete(); } catch { /* camera cache cleanup is best-effort */ }
      router.push({ pathname: '/scan/preview', params: { uri: cropped.uri, source: 'camera' } });
    } catch (error) {
      if (capturedUri) { try { const original = new File(capturedUri); if (original.exists) original.delete(); } catch { /* camera cache cleanup is best-effort */ } }
      Alert.alert('Photo not ready', error instanceof Error ? error.message : 'Try again and keep the whole card inside the guide.');
    } finally { setTaking(false); }
  };

  const chooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false });
      if (!result.canceled && result.assets[0]?.uri) router.push({ pathname: '/scan/preview', params: { uri: result.assets[0].uri, source: 'gallery' } });
    } catch { Alert.alert('Gallery unavailable', 'You can still take a photo with the camera.'); }
  };

  if (!permission) return <View style={styles.permission}><ActivityIndicator color={colors.accentBright} /></View>;
  if (!permission.granted) return <SafeAreaView style={styles.permission}>
    <Pressable onPress={() => router.back()} style={styles.close}><Text style={styles.closeText}>‹</Text></Pressable>
    <View style={styles.permissionBody}><Text style={styles.permissionIcon}>⌑</Text><Text style={styles.permissionTitle}>A quick camera moment.</Text><Text style={styles.permissionText}>Vemori uses your camera only when you choose Scan Card. Your photo stays on this device.</Text>
      {permission.canAskAgain ? <Pressable style={styles.permissionButton} onPress={requestPermission}><Text style={styles.permissionButtonText}>Allow camera</Text></Pressable> : <Pressable style={styles.permissionButton} onPress={() => import('expo-linking').then((L) => L.openSettings())}><Text style={styles.permissionButtonText}>Open device settings</Text></Pressable>}
      <Pressable onPress={chooseImage}><Text style={styles.settingsLink}>Choose a card photo instead</Text></Pressable>
    </View>
  </SafeAreaView>;

  return <View style={styles.screen}>
    <View ref={cameraArea} collapsable={false} style={StyleSheet.absoluteFill}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" mode="picture" enableTorch={flash} onCameraReady={() => setReady(true)} />
    </View>
    <SafeAreaView style={styles.overlay}>
      <View style={styles.top}><Pressable onPress={() => router.back()} style={styles.close}><Text style={styles.closeText}>‹</Text></Pressable><View style={styles.topTitle}><Text style={styles.heading}>Scan Card</Text><Text style={styles.subheading}>Keep a good connection close.</Text></View><Pressable accessibilityRole="button" accessibilityLabel={flash ? 'Turn flash off' : 'Turn flash on'} onPress={() => setFlash(!flash)} style={styles.topAction}><Text style={styles.flash}>{flash ? 'ϟ' : 'ϟ'}</Text></Pressable></View>
      <View style={styles.frameArea} pointerEvents="none">
        <Text style={styles.instruction}>Fit the whole card inside the frame</Text>
        <View ref={guide} collapsable={false} style={styles.frame}><View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} /><View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} /><View style={styles.scanLine} /></View>
        <Text style={styles.helper}>Keep it flat · Find even light · Hold steady</Text>
      </View>
      <View style={styles.controls}><Pressable accessibilityRole="button" onPress={chooseImage} style={styles.gallery}><Text style={styles.galleryIcon}>▧</Text><Text style={styles.controlLabel}>Gallery</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Capture business card" onPress={capture} disabled={taking || !ready} style={[styles.shutter, (!ready || taking) && { opacity: 0.5 }]}><View style={styles.shutterCore}>{taking && <ActivityIndicator color={colors.accent} />}</View></Pressable>
        <View style={styles.gallery}><View style={styles.shutterSpacer} /></View>
      </View>
    </SafeAreaView>
  </View>;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#100E18' }, overlay: { flex: 1, justifyContent: 'space-between' }, top: { paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center' }, close: { height: 42, width: 42, borderRadius: 21, backgroundColor: '#FFFFFF24', alignItems: 'center', justifyContent: 'center' }, closeText: { color: 'white', fontSize: 32, lineHeight: 36, marginTop: -5 }, topTitle: { flex: 1, paddingLeft: 12 }, heading: { color: 'white', fontSize: 18, fontWeight: '700' }, subheading: { color: '#FFFFFFAD', fontSize: 11, marginTop: 2 }, topAction: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF24', alignItems: 'center', justifyContent: 'center' }, flash: { color: 'white', fontSize: 22 },
  frameArea: { alignItems: 'center', paddingHorizontal: 24 }, instruction: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 22, textAlign: 'center' }, frame: { height: 225, width: '100%', maxWidth: 360, borderRadius: 15, borderWidth: 1, borderColor: '#C4B8FF70', shadowColor: '#A38DFF', shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }, corner: { position: 'absolute', width: 34, height: 34, borderColor: '#C4B8FF', borderWidth: 3 }, tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 11 }, tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 11 }, bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 11 }, br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 11 }, scanLine: { position: 'absolute', left: 11, right: 11, top: '50%', height: 1, backgroundColor: '#C4B8FF90' }, helper: { color: '#FFFFFFA8', fontSize: 11, marginTop: 18 },
  controls: { height: 130, paddingHorizontal: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#100E1855' }, gallery: { width: 70, alignItems: 'center', gap: 5 }, galleryIcon: { color: 'white', fontSize: 25 }, controlLabel: { color: '#FFFFFFD0', fontSize: 10 }, shutter: { width: 76, height: 76, borderRadius: 40, borderColor: '#FFFFFFE0', borderWidth: 4, alignItems: 'center', justifyContent: 'center' }, shutterCore: { width: 60, height: 60, borderRadius: 32, backgroundColor: '#F5F2FC', alignItems: 'center', justifyContent: 'center' }, shutterSpacer: { width: 31, height: 31, borderRadius: 8, borderWidth: 1.5, borderColor: '#FFFFFFA8' },
  permission: { flex: 1, backgroundColor: '#19142B', justifyContent: 'center', padding: 26 }, permissionBody: { alignItems: 'center' }, permissionIcon: { color: colors.accentBright, fontSize: 48 }, permissionTitle: { color: 'white', fontSize: 25, fontWeight: '700', textAlign: 'center', marginTop: 16 }, permissionText: { color: '#FFFFFFAD', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10, maxWidth: 340 }, permissionButton: { height: 52, borderRadius: radius.pill, backgroundColor: colors.accentBright, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginTop: 27 }, permissionButtonText: { color: '#241C45', fontSize: 15, fontWeight: '700' }, settingsLink: { color: '#E2DCFF', fontSize: 13, marginTop: 19 },
});
