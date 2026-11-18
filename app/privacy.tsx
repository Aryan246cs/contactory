import React, { Fragment } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { privacyPolicyEffectiveDate, privacyPolicySections, privacyPolicyUrl } from '@/data/privacyPolicy';
import { spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Privacy policy" />
        <Text style={styles.date}>EFFECTIVE {privacyPolicyEffectiveDate.toUpperCase()}</Text>
        <Text style={styles.heading}>Your contacts stay yours.</Text>
        <Text style={styles.intro}>
          This policy explains what Vemori stores on your device and what is shared when you
          choose optional features.
        </Text>
        {privacyPolicySections.map((section) => (
          <Fragment key={section.title}>
            <Text style={styles.subhead}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </Fragment>
        ))}
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(privacyPolicyUrl)}>
          <Text style={styles.link}>Open the public privacy policy</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  date: { color: colors.accent, fontSize: 9, letterSpacing: 1.2, fontWeight: '800', marginTop: 5 },
  heading: { color: colors.ink, fontSize: 28, lineHeight: 33, fontWeight: '700', letterSpacing: -1, marginTop: 12 },
  intro: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 8 },
  body: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 8 },
  subhead: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 21 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 25 },
});
