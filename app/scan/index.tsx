import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CameraView as CameraViewType } from 'expo-camera';
import { colors, radius } from '@/theme/tokens';

export default function ScanScreen() {
  const camera = useRef<CameraViewType>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [taking, setTaking] = useState(false);
  const [flash, setFlash] = useState(false);

  const capture = async () => {
    if (!camera.current || !ready || taking) return;
    setTaking(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await camera.current.takePictureAsync({ quality: 0.92 });
      if (!photo?.uri) throw new Error('Camera did not return an image.');
      router.push({ pathname: '/scan/preview', params: { uri: photo.uri, source: 'camera' } });
    } catch {
      Alert.alert('Photo not captured', 'Try taking the photo again.');
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
    <View style={styles.permissionBody}><Text style={styles.permissionIcon}>⌑</Text><Text style={styles.permissionTitle}>A quick camera moment.</Text><Text style={styles.permissionText}>Contactory uses your camera only when you choose Scan Card. Your photo stays on this device.</Text>
      {permission.canAskAgain ? <Pressable style={styles.permissionButton} onPress={requestPermission}><Text style={styles.permissionButtonText}>Allow camera</Text></Pressable> : <Pressable style={styles.permissionButton} onPress={() => import('expo-linking').then((L) => L.openSettings())}><Text style={styles.permissionButtonText}>Open device settings</Text></Pressable>}
      <Pressable onPress={chooseImage}><Text style={styles.settingsLink}>Choose a card photo instead</Text></Pressable>
    </View>
  </SafeAreaView>;

  return <View style={styles.screen}>
    <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" mode="picture" enableTorch={flash} onCameraReady={() => setReady(true)} />
    <SafeAreaView style={styles.overlay}>
      <View style={styles.top}><Pressable onPress={() => router.back()} style={styles.close}><Text style={styles.closeText}>‹</Text></Pressable><View style={styles.topTitle}><Text style={styles.heading}>Scan Card</Text><Text style={styles.subheading}>Keep a good connection close.</Text></View><Pressable accessibilityRole="button" accessibilityLabel={flash ? 'Turn flash off' : 'Turn flash on'} onPress={() => setFlash(!flash)} style={styles.topAction}><Text style={styles.flash}>{flash ? 'ϟ' : 'ϟ'}</Text></Pressable></View>
      <View style={styles.frameArea} pointerEvents="none">
        <Text style={styles.instruction}>Fit the whole card inside the frame</Text>
        <View style={styles.frame}><View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} /><View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} /><View style={styles.scanLine} /></View>
        <Text style={styles.helper}>Keep it flat · Find even light · Hold steady</Text>
      </View>
      <View style={styles.controls}><Pressable accessibilityRole="button" onPress={chooseImage} style={styles.gallery}><Text style={styles.galleryIcon}>▧</Text><Text style={styles.controlLabel}>Gallery</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Capture business card" onPress={capture} disabled={taking || !ready} style={[styles.shutter, (!ready || taking) && { opacity: 0.5 }]}><View style={styles.shutterCore}>{taking && <ActivityIndicator color={colors.accent} />}</View></Pressable>
        <View style={styles.gallery}><View style={styles.shutterSpacer} /></View>
      </View>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11150F' }, overlay: { flex: 1, justifyContent: 'space-between' }, top: { paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center' }, close: { height: 42, width: 42, borderRadius: 21, backgroundColor: '#FFFFFF24', alignItems: 'center', justifyContent: 'center' }, closeText: { color: 'white', fontSize: 32, lineHeight: 36, marginTop: -5 }, topTitle: { flex: 1, paddingLeft: 12 }, heading: { color: 'white', fontSize: 18, fontWeight: '700' }, subheading: { color: '#FFFFFFAD', fontSize: 11, marginTop: 2 }, topAction: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF24', alignItems: 'center', justifyContent: 'center' }, flash: { color: 'white', fontSize: 22 },
  frameArea: { alignItems: 'center', paddingHorizontal: 24 }, instruction: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 22, textAlign: 'center' }, frame: { height: 225, width: '100%', maxWidth: 360, borderRadius: 15 }, corner: { position: 'absolute', width: 34, height: 34, borderColor: '#E5EFCF', borderWidth: 3 }, tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 11 }, tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 11 }, bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 11 }, br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 11 }, scanLine: { position: 'absolute', left: 11, right: 11, top: '50%', height: 1, backgroundColor: '#E5EFCF90' }, helper: { color: '#FFFFFFA8', fontSize: 11, marginTop: 18 },
  controls: { height: 130, paddingHorizontal: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#11150F55' }, gallery: { width: 70, alignItems: 'center', gap: 5 }, galleryIcon: { color: 'white', fontSize: 25 }, controlLabel: { color: '#FFFFFFD0', fontSize: 10 }, shutter: { width: 76, height: 76, borderRadius: 40, borderColor: '#FFFFFFE0', borderWidth: 4, alignItems: 'center', justifyContent: 'center' }, shutterCore: { width: 60, height: 60, borderRadius: 32, backgroundColor: '#F6F5EF', alignItems: 'center', justifyContent: 'center' }, shutterSpacer: { width: 31, height: 31, borderRadius: 8, borderWidth: 1.5, borderColor: '#FFFFFFA8' },
  permission: { flex: 1, backgroundColor: '#1C211B', justifyContent: 'center', padding: 26 }, permissionBody: { alignItems: 'center' }, permissionIcon: { color: colors.accentBright, fontSize: 48 }, permissionTitle: { color: 'white', fontSize: 25, fontWeight: '700', textAlign: 'center', marginTop: 16 }, permissionText: { color: '#FFFFFFAD', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10, maxWidth: 340 }, permissionButton: { height: 52, borderRadius: radius.pill, backgroundColor: colors.accentBright, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginTop: 27 }, permissionButtonText: { color: '#1D281B', fontSize: 15, fontWeight: '700' }, settingsLink: { color: '#DDE7D1', fontSize: 13, marginTop: 19 },
});
