import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BookOpenCheck, CalendarClock, Sparkles } from 'lucide-react-native';

import { CtaButton } from '@/components/auth/CtaButton';
import { LogoMark } from '@/components/LogoMark';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ar } from '@/i18n/ar';
import { colors, radius, space } from '@/theme/tokens';

const FEATURE_ICONS = [BookOpenCheck, Sparkles, CalendarClock];

/**
 * The first screen a new student ever sees.
 *
 * Everything above the buttons has one job: make the claim concrete. "أوّل مساعد ذكاء
 * اصطناعي" alone is a boast; naming the exam, the country and the language is what makes
 * it credible, so the headline carries all three and the three feature rows show what that
 * actually buys.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen bottomInset style={styles.root}>
      <View style={styles.hero}>
        <Animated.View entering={FadeIn.duration(700)}>
          <LogoMark size={92} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(520).springify().damping(20)}>
          <Text variant="display" weight="bold" align="center" style={styles.brand}>
            BACUA
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(520).springify().damping(20)}>
          <Text variant="title" weight="semibold" align="center" style={styles.headline}>
            {ar.welcome.headline}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(340).duration(520).springify().damping(20)}>
          <Text variant="body" color={colors.text.mid} align="center" style={styles.subtitle}>
            {ar.welcome.subtitle}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.features}>
        {ar.welcome.features.map((feature, index) => {
          const Icon = FEATURE_ICONS[index] ?? Sparkles;
          return (
            <Animated.View
              key={feature}
              entering={FadeInDown.delay(460 + index * 90)
                .duration(460)
                .springify()
                .damping(20)}
            >
              <Row gap={space.md} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Icon size={17} color={colors.accent.base} strokeWidth={2.2} />
                </View>
                <Text variant="label" color={colors.text.mid} style={styles.featureText}>
                  {feature}
                </Text>
              </Row>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View
        entering={FadeInDown.delay(780).duration(520).springify().damping(20)}
        style={styles.actions}
      >
        <CtaButton
          label={ar.welcome.ctaStart}
          onPress={() => router.push('/signup')}
          icon={<Sparkles size={18} color={colors.text.onAccent} strokeWidth={2.4} />}
        />
        <CtaButton
          label={ar.welcome.ctaLogin}
          variant="ghost"
          onPress={() => router.push('/login')}
        />
        <Text variant="caption" color={colors.text.low} align="center" style={styles.footnote}>
          {ar.welcome.footnote}
        </Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.xl,
    justifyContent: 'space-between',
    paddingBottom: space.lg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: space.xxxl,
    gap: space.sm,
  },
  brand: {
    marginTop: space.lg,
    letterSpacing: 2,
  },
  headline: {
    marginTop: space.md,
  },
  subtitle: {
    marginTop: space.xs,
  },
  features: {
    gap: space.md,
    marginVertical: space.xl,
  },
  featureRow: {
    backgroundColor: colors.glass.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent.wash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.washBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  actions: {
    gap: space.md,
  },
  footnote: {
    marginTop: space.xs,
  },
});
