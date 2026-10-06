/**
 * BACUA design tokens.
 *
 * Dark-only by design. Every colour here is authored against the #070709 canvas —
 * there is no light palette to keep in sync, so values are literal rather than semantic
 * indirections through a theme object.
 */

export const colors = {
  bg: {
    base: '#070709',
    raised: '#0E0E12',
    sunken: '#050506',
    scrim: 'rgba(3,3,5,0.62)',
  },

  /** Glass surfaces. Layered over blur — never used as an opaque fill. */
  glass: {
    fill: 'rgba(255,255,255,0.045)',
    fillHi: 'rgba(255,255,255,0.075)',
    border: 'rgba(255,255,255,0.08)',
    /** The 1px top-edge highlight that makes a card read as extruded rather than flat. */
    highlight: 'rgba(255,255,255,0.13)',
  },

  accent: {
    base: '#E8863F',
    light: '#F5B478',
    deep: '#C46A2A',
    /** Halo colour for shadows around accent elements. */
    glow: 'rgba(232,134,63,0.22)',
    /** Tint for surfaces that should read as "accent-adjacent" but stay quiet. */
    wash: 'rgba(232,134,63,0.12)',
    washBorder: 'rgba(232,134,63,0.22)',
  },

  text: {
    hi: '#F4F3F1',
    mid: 'rgba(244,243,241,0.62)',
    low: 'rgba(244,243,241,0.36)',
    onAccent: '#1A0E05',
  },

  danger: '#E5484D',
  success: '#46A758',
} as const;

/**
 * Aurora blob colours. Deliberately desaturated — at 60px blur and low opacity
 * anything more saturated turns the canvas muddy.
 */
export const auroraColors = [
  ['rgba(232,134,63,0.34)', 'rgba(232,134,63,0)'],
  ['rgba(120,86,196,0.26)', 'rgba(120,86,196,0)'],
  ['rgba(38,140,150,0.20)', 'rgba(38,140,150,0)'],
  ['rgba(196,106,42,0.22)', 'rgba(196,106,42,0)'],
] as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Spring config used for every touch-driven animation.
 * Nothing a finger controls should use linear timing.
 */
export const spring = {
  damping: 18,
  stiffness: 180,
  mass: 0.9,
} as const;

/** Snappier variant for small elements (chips, send button). */
export const springSnappy = {
  damping: 15,
  stiffness: 260,
  mass: 0.6,
} as const;

export const shadow = {
  /** Soft ambient lift for glass cards. */
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  /** Copper halo for accent controls. */
  glow: {
    shadowColor: colors.accent.base,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  /** Large shadow on the main screen when it tips back behind the drawer. */
  drawerLift: {
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 40,
    shadowOffset: { width: -12, height: 0 },
    elevation: 24,
  },
} as const;
