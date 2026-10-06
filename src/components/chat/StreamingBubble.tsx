import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { LogoMark } from '../LogoMark';
import { Markdown } from '../Markdown';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import { colors, space } from '@/theme/tokens';
import { useChat } from '@/store/chat';

/**
 * The in-flight response.
 *
 * Subscribes to `streamingText` alone. That slice is the only thing changing ~30 times a
 * second, so keeping it out of the messages array confines those re-renders to this one
 * component instead of the whole list.
 */
export function StreamingBubble() {
  const text = useChat((s) => s.streamingText);
  const hasText = text.length > 0;

  return (
    <View style={styles.wrap}>
      {hasText ? (
        <View style={styles.body}>
          <Markdown source={text} />
          <Caret />
        </View>
      ) : (
        <Row gap={space.md} style={styles.thinking}>
          <LogoMark size={22} thinking />
          <ShimmerText />
        </Row>
      )}
    </View>
  );
}

/** Blinking block cursor at the tail of the streamed text. */
function Caret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.15, { duration: 620, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.caret, style]} />;
}

function ShimmerText() {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={style}>
      <Text variant="caption" color={colors.text.mid}>
        {`${ar.chat.thinking}...`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.xl,
  },
  body: {
    borderRightWidth: 2,
    borderRightColor: colors.accent.base,
    paddingRight: space.lg,
  },
  thinking: {
    paddingRight: space.sm,
  },
  caret: {
    width: 7,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.accent.base,
    alignSelf: 'flex-end',
    marginTop: space.xs,
  },
});
