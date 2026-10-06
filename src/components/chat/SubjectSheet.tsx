import { Modal, Pressable as RNPressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import { subjectsForStream } from '@/data/curriculum';
import { colors, radius, space } from '@/theme/tokens';
import { useSettings } from '@/store/settings';

export type SubjectSheetProps = {
  visible: boolean;
  selected: string | null;
  onSelect: (subjectId: string | null) => void;
  onClose: () => void;
};

/**
 * Subject picker for the composer chip.
 *
 * Lists only the subjects in the student's own stream — offering محاسبة to a علوم تجريبية
 * student is noise, and the stream is already known from settings.
 */
export function SubjectSheet({ visible, selected, onSelect, onClose }: SubjectSheetProps) {
  const insets = useSafeAreaInsets();
  const streamId = useSettings((s) => s.streamId);
  const subjects = subjectsForStream(streamId);

  function pick(subjectId: string | null) {
    onSelect(subjectId);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(160)} style={styles.backdrop}>
        <RNPressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={ar.common.cancel} />

        <Animated.View
          entering={SlideInDown.duration(280).springify().damping(22)}
          style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}
        >
          <View style={styles.grabber} />

          <Text variant="heading" weight="semibold" style={styles.title}>
            {ar.chat.pickSubject}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            <SubjectRow
              label={ar.chat.subjectAll}
              hue={colors.text.mid}
              selected={selected === null}
              onPress={() => pick(null)}
            />
            {subjects.map((subject) => (
              <SubjectRow
                key={subject.id}
                label={subject.name}
                meta={`${ar.doross.coefficient} ${subject.coefficient}`}
                hue={subject.hue}
                selected={selected === subject.id}
                onPress={() => pick(subject.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function SubjectRow({
  label,
  meta,
  hue,
  selected,
  onPress,
}: {
  label: string;
  meta?: string;
  hue: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} scaleTo={0.98} style={[styles.row, selected ? styles.rowSelected : null]}>
      <Row gap={space.md}>
        <View style={[styles.dot, { backgroundColor: hue }]} />
        <View style={styles.rowText}>
          <Text variant="subheading" color={selected ? colors.text.hi : colors.text.mid}>
            {label}
          </Text>
          {meta ? (
            <Text variant="caption" color={colors.text.low}>
              {meta}
            </Text>
          ) : null}
        </View>
        {selected ? <Check size={18} color={colors.accent.base} strokeWidth={2.4} /> : null}
      </Row>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.bg.scrim,
  },
  sheet: {
    backgroundColor: colors.bg.raised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    maxHeight: '72%',
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glass.fillHi,
    marginBottom: space.lg,
  },
  title: {
    marginBottom: space.md,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  rowSelected: {
    backgroundColor: colors.glass.fill,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
