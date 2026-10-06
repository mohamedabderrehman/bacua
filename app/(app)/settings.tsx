import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { CalendarDays, ChevronDown, Info } from 'lucide-react-native';

import { AppHeader } from '@/components/AppHeader';
import { StreamPicker } from '@/components/settings/StreamPicker';
import {
  Segmented,
  SettingsRow,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/SettingsRow';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ar } from '@/i18n/ar';
import { getStream } from '@/data/curriculum';
import { ai } from '@/services/ai';
import { colors, radius, space } from '@/theme/tokens';
import { fonts, textScales, variants, type TextScaleName } from '@/theme/typography';
import { formatDateAr, toIsoDate } from '@/utils/date';
import { useAuth } from '@/store/auth';
import { useChat } from '@/store/chat';
import { daysUntil, useSettings } from '@/store/settings';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [streamPickerOpen, setStreamPickerOpen] = useState(false);
  const [iosPickerOpen, setIosPickerOpen] = useState(false);

  const settings = useSettings();
  const clearAll = useChat((s) => s.clearAll);
  const account = useAuth((s) => s.account);
  const signOut = useAuth((s) => s.signOut);

  const remaining = daysUntil(settings.examDate);
  const stream = getStream(settings.streamId);

  function openDatePicker() {
    const current = new Date(`${settings.examDate}T00:00:00`);
    if (Platform.OS === 'android') {
      // Android's picker is imperative; iOS renders a component. Both land on the
      // same setExamDate call.
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === 'set' && date) settings.setExamDate(toIsoDate(date));
        },
      });
    } else {
      setIosPickerOpen((v) => !v);
    }
  }

  function confirmSignOut() {
    Alert.alert(ar.settings.signOutConfirmTitle, ar.settings.signOutConfirmBody, [
      { text: ar.common.cancel, style: 'cancel' },
      { text: ar.settings.signOut, style: 'destructive', onPress: signOut },
    ]);
  }

  function confirmClearAll() {
    Alert.alert(ar.settings.clearAllConfirmTitle, ar.settings.clearAllConfirmBody, [
      { text: ar.common.cancel, style: 'cancel' },
      {
        text: ar.common.delete,
        style: 'destructive',
        onPress: () => {
          clearAll();
          Alert.alert(ar.settings.clearAllDone);
        },
      },
    ]);
  }

  const sizeOptions: Array<{ value: TextScaleName; label: string }> = [
    { value: 'sm', label: ar.settings.textSizeSm },
    { value: 'md', label: ar.settings.textSizeMd },
    { value: 'lg', label: ar.settings.textSizeLg },
  ];

  return (
    <Screen>
      <AppHeader title={ar.settings.title} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.countdown}>
          <Row gap={space.md}>
            <CalendarDays size={22} color={colors.accent.base} strokeWidth={2} />
            <View style={styles.countdownText}>
              <Text variant="heading" weight="semibold" color={colors.accent.light}>
                {remaining > 0
                  ? ar.settings.countdown(remaining)
                  : remaining === 0
                    ? ar.settings.countdownToday
                    : ar.settings.countdownPassed}
              </Text>
              <Text variant="caption" color={colors.text.low}>
                {formatDateAr(settings.examDate)}
              </Text>
            </View>
          </Row>
        </View>

        <SettingsSection title={ar.settings.studySection}>
          <SettingsRow
            label={ar.settings.name}
            right={
              <TextInput
                value={settings.name}
                onChangeText={settings.setName}
                placeholder={ar.settings.namePlaceholder}
                placeholderTextColor={colors.text.low}
                style={[
                  styles.nameInput,
                  {
                    fontFamily: fonts.regular,
                    fontSize: Math.round(variants.body.fontSize * textScales[settings.textScale]),
                  },
                ]}
                textAlign="right"
                maxLength={24}
              />
            }
          />
          <SettingsRow
            label={ar.settings.stream}
            onPress={() => setStreamPickerOpen(true)}
            right={
              <Row gap={6}>
                <Text variant="body" color={colors.text.mid}>
                  {stream.name}
                </Text>
                <ChevronDown size={16} color={colors.text.low} strokeWidth={2.2} />
              </Row>
            }
          />
          <SettingsRow
            label={ar.settings.examDate}
            onPress={openDatePicker}
            last
            right={
              <Text variant="body" color={colors.text.mid}>
                {formatDateAr(settings.examDate)}
              </Text>
            }
            below={
              iosPickerOpen && Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={new Date(`${settings.examDate}T00:00:00`)}
                  mode="date"
                  display="spinner"
                  themeVariant="dark"
                  minimumDate={new Date()}
                  onChange={(_event, date) => {
                    if (date) settings.setExamDate(toIsoDate(date));
                  }}
                />
              ) : null
            }
          />
        </SettingsSection>

        <SettingsSection title={ar.settings.appearanceSection}>
          <SettingsRow
            label={ar.settings.darkMode}
            hint={ar.settings.darkModeNote}
            right={<SettingsSwitch value onValueChange={() => undefined} disabled />}
          />
          <SettingsRow
            label={ar.settings.textSize}
            below={
              <Segmented
                options={sizeOptions}
                value={settings.textScale}
                onChange={settings.setTextScale}
              />
            }
          />
          <SettingsRow
            label={ar.settings.reduceMotion}
            hint={ar.settings.reduceMotionNote}
            last
            right={
              <SettingsSwitch
                value={settings.reduceMotion}
                onValueChange={(next) => settings.setReduceMotion(next)}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title={ar.settings.chatSection}>
          <SettingsRow
            label={ar.settings.haptics}
            right={<SettingsSwitch value={settings.haptics} onValueChange={settings.setHaptics} />}
          />
          <SettingsRow
            label={ar.settings.sound}
            right={<SettingsSwitch value={settings.sound} onValueChange={settings.setSound} />}
          />
          <SettingsRow
            label={ar.settings.saveHistory}
            hint={ar.settings.saveHistoryNote}
            right={
              <SettingsSwitch value={settings.saveHistory} onValueChange={settings.setSaveHistory} />
            }
          />
          <SettingsRow label={ar.settings.clearAll} onPress={confirmClearAll} danger last />
        </SettingsSection>

        <SettingsSection title={ar.settings.accountSection}>
          {account && (account.email || account.phone) ? (
            <SettingsRow
              label={`${account.firstName} ${account.lastName}`.trim() || ar.app.name}
              hint={account.email || account.phone}
            />
          ) : null}
          <SettingsRow label={ar.settings.signOut} onPress={confirmSignOut} danger last />
        </SettingsSection>

        <SettingsSection title={ar.settings.aboutSection}>
          <SettingsRow
            label={ar.settings.version}
            right={
              <Text variant="body" color={colors.text.mid} ltr>
                {Constants.expoConfig?.version ?? '1.0.0'}
              </Text>
            }
          />
          <SettingsRow label={ar.settings.privacy} onPress={() => undefined} />
          <SettingsRow label={ar.settings.contact} onPress={() => undefined} last />
        </SettingsSection>

        <View style={styles.about}>
          <Text variant="caption" color={colors.text.low}>
            {ar.settings.aboutBody}
          </Text>
          {ai.isMock ? (
            <Row gap={space.sm} align="flex-start" style={styles.mockNotice}>
              <Info size={15} color={colors.accent.base} strokeWidth={2} style={styles.mockIcon} />
              <Text variant="caption" color={colors.accent.light} style={styles.mockText}>
                {ar.settings.mockNotice}
              </Text>
            </Row>
          ) : null}
        </View>
      </ScrollView>

      <StreamPicker
        visible={streamPickerOpen}
        selected={settings.streamId}
        onSelect={settings.setStream}
        onClose={() => setStreamPickerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  countdown: {
    backgroundColor: colors.accent.wash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.washBorder,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  countdownText: {
    flex: 1,
    gap: 2,
  },
  nameInput: {
    color: colors.text.hi,
    minWidth: 140,
    padding: 0,
    writingDirection: 'rtl',
  },
  about: {
    marginTop: space.xl,
    paddingHorizontal: space.xs,
    gap: space.md,
  },
  mockNotice: {
    backgroundColor: colors.accent.wash,
    borderRadius: radius.md,
    padding: space.md,
  },
  mockIcon: {
    marginTop: 3,
  },
  mockText: {
    flex: 1,
  },
});
