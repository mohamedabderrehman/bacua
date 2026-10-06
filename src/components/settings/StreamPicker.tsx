import { Modal, Pressable as RNPressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import { streams, type StreamId } from '@/data/curriculum';
import { colors, radius, space } from '@/theme/tokens';

export type StreamPickerProps = {
  visible: boolean;
  selected: StreamId;
  onSelect: (streamId: StreamId) => void;
  onClose: () => void;
};

/** Bottom sheet listing the six Algerian BAC streams, with their subject count as a hint. */
export function StreamPicker({ visible, selected, onSelect, onClose }: StreamPickerProps) {
  const insets = useSafeAreaInsets();

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
            {ar.settings.stream}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {streams.map((stream) => {
              const isSelected = stream.id === selected;
              return (
                <Pressable
                  key={stream.id}
                  onPress={() => {
                    onSelect(stream.id);
                    onClose();
                  }}
                  scaleTo={0.98}
                  style={[styles.row, isSelected ? styles.rowSelected : null]}
                >
                  <Row gap={space.md}>
                    <View style={styles.rowText}>
                      <Text variant="subheading" color={isSelected ? colors.text.hi : colors.text.mid}>
                        {stream.name}
                      </Text>
                      <Text variant="caption" color={colors.text.low}>
                        {`${stream.subjects.length} مواد`}
                      </Text>
                    </View>
                    {isSelected ? <Check size={18} color={colors.accent.base} strokeWidth={2.4} /> : null}
                  </Row>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
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
});
