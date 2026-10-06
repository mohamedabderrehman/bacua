import { StyleSheet, View } from 'react-native';
import {
  Atom,
  BookOpen,
  Brain,
  Calculator,
  Cpu,
  Dna,
  Globe,
  Languages,
  MoonStar,
  Scale,
  Sigma,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';

import { ProgressRing } from './ProgressRing';
import { GlassCard } from '../ui/GlassCard';
import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import { countLessons, type Subject, type SubjectIconKey } from '@/data/curriculum';
import { colors, radius, space } from '@/theme/tokens';

const ICONS: Record<SubjectIconKey, LucideIcon> = {
  sigma: Sigma,
  atom: Atom,
  dna: Dna,
  book: BookOpen,
  brain: Brain,
  globe: Globe,
  languages: Languages,
  moon: MoonStar,
  calculator: Calculator,
  trending: TrendingUp,
  scale: Scale,
  cpu: Cpu,
};

export type SubjectCardProps = {
  subject: Subject;
  coefficient: number;
  ratio: number;
  selected: boolean;
  onPress: () => void;
};

export function SubjectCard({ subject, coefficient, ratio, selected, onPress }: SubjectCardProps) {
  const Icon = ICONS[subject.icon];

  return (
    <Pressable onPress={onPress} scaleTo={0.96} style={styles.pressable}>
      {/* blur={false}: this renders many times inside a scrolling grid — see GlassCard. */}
      <GlassCard
        r={radius.lg}
        blur={false}
        active={selected}
        borderColor={selected ? subject.hue : colors.glass.border}
        style={styles.card}
      >
        <Row justify="space-between" align="flex-start">
          <View style={[styles.iconBadge, { backgroundColor: `${subject.hue}22`, borderColor: `${subject.hue}44` }]}>
            <Icon size={19} color={subject.hue} strokeWidth={2} />
          </View>
          <ProgressRing ratio={ratio} size={38} stroke={3.5} color={subject.hue} showLabel={false} />
        </Row>

        <View style={styles.body}>
          <Text variant="subheading" weight="semibold" numberOfLines={2}>
            {subject.name}
          </Text>
          <Text variant="caption" color={colors.text.low}>
            {`${ar.doross.coefficient} ${coefficient} · ${ar.doross.lessons(countLessons(subject))}`}
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  card: {
    padding: space.lg,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: space.lg,
    gap: 2,
  },
});
