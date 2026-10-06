import { usePathname, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, MessageSquare, Plus, Settings2, Trash2 } from 'lucide-react-native';

import { LogoMark } from './LogoMark';
import { Pressable } from './ui/Pressable';
import { Row } from './ui/Row';
import { Text } from './ui/Text';
import { ar } from '@/i18n/ar';
import { colors, radius, shadow, space } from '@/theme/tokens';
import { useChat } from '@/store/chat';

/**
 * Drawer panel contents: brand, new-chat action, conversation history, and the two
 * destination links the brief calls for.
 *
 * The panel sits behind the main screen, so it uses solid surfaces rather than glass —
 * blur here would blur the panel's own background and read as mud.
 */
export function DrawerContent({ onNavigate }: { onNavigate: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const conversations = useChat((s) => s.conversations);
  const activeId = useChat((s) => s.activeId);
  const newConversation = useChat((s) => s.newConversation);
  const setActive = useChat((s) => s.setActive);
  const deleteConversation = useChat((s) => s.deleteConversation);

  function go(path: '/' | '/doross' | '/settings') {
    if (pathname !== path) router.replace(path);
    onNavigate();
  }

  function startNewChat() {
    newConversation();
    go('/');
  }

  function openConversation(id: string) {
    setActive(id);
    go('/');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.lg }]}>
      <Row gap={space.md} style={styles.brand}>
        <LogoMark size={26} />
        <Text variant="heading" weight="bold" ltr>
          BACUA
        </Text>
      </Row>

      <Pressable onPress={startNewChat} scaleTo={0.96} haptic="medium" style={styles.newChat}>
        <Row gap={space.sm} justify="center">
          <Plus size={17} color={colors.accent.light} strokeWidth={2.4} />
          <Text variant="label" color={colors.accent.light}>
            {ar.drawer.newChat}
          </Text>
        </Row>
      </Pressable>

      <Text variant="caption" color={colors.text.low} style={styles.sectionLabel}>
        {ar.drawer.recent}
      </Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 ? (
          <Text variant="caption" color={colors.text.low} style={styles.empty}>
            {ar.drawer.noConversations}
          </Text>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeId && pathname === '/';
            return (
              <Row key={conversation.id} gap={space.xs}>
                <Pressable
                  onPress={() => openConversation(conversation.id)}
                  scaleTo={0.98}
                  style={[styles.row, isActive ? styles.rowActive : null, styles.rowGrow]}
                >
                  <Row gap={space.sm}>
                    <MessageSquare
                      size={15}
                      color={isActive ? colors.accent.light : colors.text.low}
                      strokeWidth={2}
                    />
                    <Text
                      variant="caption"
                      color={isActive ? colors.text.hi : colors.text.mid}
                      numberOfLines={1}
                      style={styles.rowLabel}
                    >
                      {conversation.title}
                    </Text>
                  </Row>
                </Pressable>

                <Pressable
                  onPress={() => deleteConversation(conversation.id)}
                  scaleTo={0.9}
                  accessibilityLabel={ar.common.delete}
                  style={styles.deleteButton}
                >
                  <Trash2 size={14} color={colors.text.low} strokeWidth={2} />
                </Pressable>
              </Row>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        <NavRow
          label={ar.drawer.doross}
          icon={<BookOpen size={18} color={pathname === '/doross' ? colors.accent.light : colors.text.mid} strokeWidth={2} />}
          active={pathname === '/doross'}
          onPress={() => go('/doross')}
        />
        <NavRow
          label={ar.drawer.settings}
          icon={<Settings2 size={18} color={pathname === '/settings' ? colors.accent.light : colors.text.mid} strokeWidth={2} />}
          active={pathname === '/settings'}
          onPress={() => go('/settings')}
        />
      </View>
    </View>
  );
}

function NavRow({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} scaleTo={0.97} style={[styles.navRow, active ? styles.rowActive : null]}>
      <Row gap={space.md}>
        {icon}
        <Text variant="subheading" color={active ? colors.text.hi : colors.text.mid}>
          {label}
        </Text>
      </Row>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.raised,
    paddingHorizontal: space.lg,
  },
  brand: {
    marginBottom: space.xl,
    paddingHorizontal: space.xs,
  },
  newChat: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.washBorder,
    backgroundColor: colors.accent.wash,
    paddingVertical: space.md,
    ...shadow.glow,
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  sectionLabel: {
    marginTop: space.xl,
    marginBottom: space.sm,
    paddingHorizontal: space.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 2,
    paddingBottom: space.lg,
  },
  empty: {
    paddingHorizontal: space.xs,
    paddingVertical: space.md,
  },
  row: {
    borderRadius: radius.sm,
    paddingVertical: space.sm + 1,
    paddingHorizontal: space.sm,
  },
  rowGrow: {
    flex: 1,
  },
  rowLabel: {
    flex: 1,
  },
  rowActive: {
    backgroundColor: colors.glass.fillHi,
  },
  deleteButton: {
    padding: space.sm,
    borderRadius: radius.sm,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
    paddingTop: space.md,
    gap: 2,
  },
  navRow: {
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
  },
});
