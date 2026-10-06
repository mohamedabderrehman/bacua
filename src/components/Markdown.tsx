import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text as RNText, View } from 'react-native';

import { Text } from './ui/Text';
import { colors, radius, space } from '@/theme/tokens';
import { fonts, textScales, variants } from '@/theme/typography';
import { useSettings } from '@/store/settings';

/**
 * Minimal markdown renderer.
 *
 * Written rather than pulled from npm because every markdown package for React Native
 * lays out left-to-right: bullets land on the wrong side, blockquote rules draw on the
 * wrong edge, and nested Arabic text loses its direction. Supporting the small subset the
 * answers actually use is less work than patching that.
 *
 * Supported: headings (##, ###), bullets, ordered lists, blockquotes, fenced code,
 * pipe tables, horizontal rules, **bold**, `inline code`.
 */

import { parseBlocks, type Block } from '@/utils/markdownParser';

type Span = { type: 'text' | 'bold' | 'code'; value: string };

function parseInline(text: string): Span[] {
  const spans: Span[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      spans.push({ type: 'text', value: text.slice(cursor, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**')) {
      spans.push({ type: 'bold', value: token.slice(2, -2) });
    } else {
      spans.push({ type: 'code', value: token.slice(1, -1) });
    }
    cursor = match.index + token.length;
  }
  if (cursor < text.length) {
    spans.push({ type: 'text', value: text.slice(cursor) });
  }
  return spans;
}

/** Inline spans render as nested RN Text so they wrap with the surrounding paragraph. */
function Inline({ text, color, scale }: { text: string; color: string; scale: number }) {
  const spans = useMemo(() => parseInline(text), [text]);

  return (
    <>
      {spans.map((span, index) => {
        if (span.type === 'bold') {
          return (
            <RNText key={index} style={{ fontFamily: fonts.semibold, color: colors.text.hi }}>
              {span.value}
            </RNText>
          );
        }
        if (span.type === 'code') {
          return (
            <RNText
              key={index}
              style={{
                fontFamily: fonts.medium,
                color: colors.accent.light,
                fontSize: Math.round(variants.body.fontSize * scale * 0.94),
              }}
            >
              {` ${span.value} `}
            </RNText>
          );
        }
        return (
          <RNText key={index} style={{ color }}>
            {span.value}
          </RNText>
        );
      })}
    </>
  );
}

export function Markdown({ source, color = colors.text.hi }: { source: string; color?: string }) {
  const scaleName = useSettings((s) => s.textScale);
  const scale = textScales[scaleName];
  const blocks = useMemo(() => parseBlocks(source), [source]);

  return (
    <View style={styles.root}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <Text
                key={index}
                variant={block.level === 2 ? 'heading' : 'subheading'}
                weight="semibold"
                style={index === 0 ? styles.headingFirst : styles.heading}
              >
                <Inline text={block.text} color={colors.text.hi} scale={scale} />
              </Text>
            );

          case 'paragraph':
            return (
              <Text key={index} variant="body">
                <Inline text={block.text} color={color} scale={scale} />
              </Text>
            );

          case 'bullet':
            return (
              <View key={index} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listRow}>
                    <View style={styles.bulletDot} />
                    <Text variant="body" style={styles.listText}>
                      <Inline text={item} color={color} scale={scale} />
                    </Text>
                  </View>
                ))}
              </View>
            );

          case 'ordered':
            return (
              <View key={index} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listRow}>
                    <Text
                      variant="body"
                      weight="semibold"
                      color={colors.accent.base}
                      style={styles.ordinal}
                    >
                      {`${itemIndex + 1}.`}
                    </Text>
                    <Text variant="body" style={styles.listText}>
                      <Inline text={item} color={color} scale={scale} />
                    </Text>
                  </View>
                ))}
              </View>
            );

          case 'quote':
            return (
              <View key={index} style={styles.quote}>
                <Text variant="body" color={colors.text.mid}>
                  <Inline text={block.text} color={colors.text.mid} scale={scale} />
                </Text>
              </View>
            );

          case 'code':
            return (
              <ScrollView
                key={index}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.codeScroll}
                contentContainerStyle={styles.codeContent}
              >
                <Text variant="mono" color={colors.accent.light} ltr>
                  {block.text}
                </Text>
              </ScrollView>
            );

          case 'table':
            return <Table key={index} block={block} scale={scale} />;

          case 'rule':
            return <View key={index} style={styles.rule} />;

          default:
            return null;
        }
      })}
    </View>
  );
}

function Table({
  block,
  scale,
}: {
  block: Extract<Block, { kind: 'table' }>;
  scale: number;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {block.header.map((cell, index) => (
          <View key={index} style={styles.tableCell}>
            <Text variant="caption" weight="semibold" color={colors.accent.light}>
              {cell}
            </Text>
          </View>
        ))}
      </View>
      {block.rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.tableRow, rowIndex === block.rows.length - 1 ? styles.tableRowLast : null]}
        >
          {row.map((cell, cellIndex) => (
            <View key={cellIndex} style={styles.tableCell}>
              <Text variant="caption" color={colors.text.mid}>
                <Inline text={cell} color={colors.text.mid} scale={scale} />
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
  },
  heading: {
    marginTop: space.md,
  },
  headingFirst: {
    marginTop: 0,
  },
  list: {
    gap: space.xs,
  },
  // row-reverse so the marker sits on the right, where an Arabic list begins.
  listRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent.base,
    marginTop: 11,
  },
  ordinal: {
    minWidth: 20,
  },
  listText: {
    flex: 1,
  },
  quote: {
    // Border on the right — a quote rule belongs on the side the text starts from.
    borderRightWidth: 2,
    borderRightColor: colors.accent.base,
    paddingRight: space.md,
    paddingVertical: space.xs,
    marginVertical: space.xs,
  },
  codeScroll: {
    backgroundColor: colors.bg.sunken,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    marginVertical: space.xs,
  },
  codeContent: {
    padding: space.md,
  },
  table: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginVertical: space.xs,
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.glass.fill,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glass.border,
    marginVertical: space.sm,
  },
});
