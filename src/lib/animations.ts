/**
 * @fileoverview Framer Motion animation presets for AgriNex AI.
 * Import these variants into any component that uses <motion.* />.
 */
import type { Variants } from "framer-motion";

// ============================================================
//  BASE TRANSITION CONFIGS
// ============================================================

/** Standard spring — snappy but smooth */
export const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

/** Gentle spring — for larger panels and modals */
export const SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
};

// ============================================================
//  PAGE TRANSITIONS
// ============================================================

/**
 * Page enter/exit animation — fade up on enter, fade down on exit.
 * Use on the outermost <motion.div> of each page component.
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.3 },
  },
};

// ============================================================
//  STAGGER CONTAINER
// ============================================================

/**
 * Wraps a list of items so each child staggers in sequentially.
 * Pair with `listItemVariants` on children.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// ============================================================
//  LIST / CARD ITEMS
// ============================================================

/**
 * Child item that slides up + fades in.
 * Use inside a `staggerContainerVariants` parent.
 */
export const listItemVariants: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: SPRING_TRANSITION },
};

// ============================================================
//  HOVER / TAP INTERACTIONS
// ============================================================

/**
 * Subtle scale on hover and tap — for clickable cards and buttons.
 * Use with `whileHover="hover" whileTap="tap"`.
 */
export const hoverScaleVariants: Variants = {
  hover: { scale: 1.03 },
  tap:   { scale: 0.98 },
};

// ============================================================
//  MODALS
// ============================================================

/**
 * Full-screen modal backdrop overlay.
 * Wrap the overlay div with AnimatePresence + this variant.
 */
export const modalOverlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Modal content panel — slides up from below on open, shrinks on close.
 */
export const modalContentVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: SPRING_TRANSITION },
  exit:    { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};

// ============================================================
//  SLIDE-IN PANELS (Sidebar / Drawers)
// ============================================================

/** Slide in from the left (sidebar) */
export const slideInLeftVariants: Variants = {
  hidden:  { x: "-100%", opacity: 0 },
  visible: { x: 0,       opacity: 1, transition: SPRING_GENTLE },
  exit:    { x: "-100%", opacity: 0, transition: { duration: 0.25 } },
};

/** Slide in from the right (cart drawer, notification panel) */
export const slideInRightVariants: Variants = {
  hidden:  { x: "100%",  opacity: 0 },
  visible: { x: 0,       opacity: 1, transition: SPRING_GENTLE },
  exit:    { x: "100%",  opacity: 0, transition: { duration: 0.25 } },
};

// ============================================================
//  FADE ONLY
// ============================================================

/** Simple opacity fade — for tooltips, badges */
export const fadeVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};
