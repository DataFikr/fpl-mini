# Micro-Interaction Patterns — FR-DLS Animation Reference v2.0

> Standalone animation reference for FPL Ranker components.
> All animations use only `transform` and `opacity` for 60fps GPU compositing.
> Every pattern includes a `prefers-reduced-motion` fallback.
> **v2.0:** Added page transitions, scroll reveals, 3D tilt, spring physics, parallax, magnetic buttons, animated borders, stat cascade.

---

## 1. CSS Keyframes

### Shimmer (Skeleton Loading)

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Usage: Apply to ::after pseudo-element on skeleton containers */
.skeleton {
  position: relative;
  overflow: hidden;
  background: #1e293b; /* slate-800 */
  border-radius: 12px; /* rounded-fpl */
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.04) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Counter Fade-In

```css
@keyframes counterFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Applied per-digit or per-counter with 150ms stagger delay */
.counter-enter {
  animation: counterFadeIn 300ms ease-out forwards;
}
```

### Toast Enter / Exit

```css
@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toastExit {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(16px);
  }
}

.toast-enter { animation: toastEnter 200ms ease-out forwards; }
.toast-exit { animation: toastExit 150ms ease-in forwards; }
```

### Badge Reveal (Spring Overshoot)

```css
@keyframes badgeReveal {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70% {
    opacity: 1;
    transform: scale(1.15);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.badge-reveal {
  animation: badgeReveal 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

### Card Glow Pulse

```css
@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(120, 255, 158, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(120, 255, 158, 0.4);
  }
}

/* Triggered on player haul >= 10pts */
.haul-glow {
  animation: cardGlow 2s ease-in-out infinite;
}

/* Captain haul uses amber */
@keyframes captainGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.2); }
  50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.4); }
}
```

### Progress Bar Fill

```css
/* No keyframe needed — use transition-[width] */
.progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(to right, #78FF9E, #65a30d); /* fpl-accent to fpl-lime-600 */
  transition: width 700ms ease-out;
}

/* Start at width: 0%, set target width via inline style or JS */
```

---

## 2. React Hooks

### `useAnimatedCounter`

Animates a numeric value from 0 to target using `requestAnimationFrame`.

```tsx
import { useState, useEffect, useRef } from 'react';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useAnimatedCounter(
  target: number,
  duration = 800,
  shouldAnimate = true
): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!shouldAnimate) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOut(progress) * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, shouldAnimate]);

  return value;
}
```

**Usage:**
```tsx
const count = useAnimatedCounter(1247, 800, isInView);
// Render: <span className="font-jakarta text-4xl font-extrabold text-fpl-accent">{count}</span>
```

### `useIntersectionTrigger`

Detects when an element enters the viewport. Used to trigger animated counters and badge reveals.

```tsx
import { useState, useEffect, useRef } from 'react';

export function useIntersectionTrigger(
  threshold = 0.3,
  triggerOnce = true
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return [ref, isInView];
}
```

### `useMouseGlow`

Stripe-inspired cursor-tracking radial glow effect for glass cards. Desktop only.

```tsx
import { useCallback, useEffect, useRef } from 'react';

export function useMouseGlow(): React.RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only enable on desktop (no touch)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, [handleMove]);

  return ref;
}
```

**CSS companion (apply to the card):**
```css
.glow-card {
  position: relative;
  overflow: hidden;
}
.glow-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(120, 255, 158, 0.06),
    transparent 40%
  );
  pointer-events: none;
  z-index: 1;
}
```

### `useReducedMotion`

Checks user's motion preference. Use to conditionally skip animations.

```tsx
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

---

## 3. Reduced Motion Override Block

Apply this globally in `globals.css` or as a utility:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all custom keyframe animations */
  .skeleton::after,
  .haul-glow,
  .badge-reveal,
  .toast-enter,
  .toast-exit,
  [class*="animate-"] {
    animation: none !important;
  }

  /* Disable hover transforms */
  .hover\:-translate-y-1:hover,
  .hover\:-translate-y-0\.5:hover {
    transform: none !important;
  }

  /* Instant transitions */
  .progress-fill,
  [class*="transition-"] {
    transition-duration: 0.01ms !important;
  }

  /* Show final states immediately */
  .badge-reveal { opacity: 1; transform: scale(1); }
  .counter-enter { opacity: 1; transform: translateY(0); }
  .toast-enter { opacity: 1; }
}
```

---

## 4. Performance Rules

1. **GPU-only properties**: Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` directly — use `transform: scale()` or `transform: translate()` instead.
2. **`will-change` sparingly**: Add `will-change: transform` only to elements actively animating. Remove after animation completes.
3. **No `setInterval`**: Use `requestAnimationFrame` for all JS-driven animations (counters, progress bars).
4. **Intersection gating**: Use `IntersectionObserver` to start animations only when visible. This prevents off-screen animation overhead.
5. **Stagger limits**: Maximum 200ms stagger offset between siblings. Cap total stagger at 1s for groups >5 items.
6. **Debounce mouse events**: For `useMouseGlow`, the `mousemove` handler runs at display refresh rate via the RAF already provided by the browser. No additional throttling needed for CSS custom property updates.

---

## 5. Animation Timing Reference

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Skeleton shimmer | 1.5s (infinite) | `ease-in-out` | Component mount |
| Animated counter | 800ms | `ease-out` (cubic) | IntersectionObserver |
| Counter stagger | +150ms per sibling | — | Sequential delay |
| Toast enter | 200ms | `ease-out` | User action |
| Toast exit | 150ms | `ease-in` | Auto-dismiss or manual |
| Badge reveal | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Milestone hit |
| Card glow pulse | 2s (infinite) | `ease-in-out` | Haul event |
| Progress bar fill | 700ms | `ease-out` | Data load |
| Hover lift | 200ms | `ease` (default) | Mouse enter |
| Active press | 100ms | `ease` | Mouse down |

---

---

## 6. Page Transition Animations

Smooth route-change transitions for Next.js App Router.

### Enter Animation

```css
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: pageEnter 200ms ease-out forwards;
}
```

### Exit Animation

```css
@keyframes pageExit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

.page-exit {
  animation: pageExit 100ms ease-in forwards;
}
```

### Next.js Implementation

```tsx
// In layout.tsx, wrap children with AnimatePresence
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1, ease: 'easeIn' } },
};

// Apply to page wrapper:
<motion.div
  initial="initial"
  animate="enter"
  exit="exit"
  variants={pageVariants}
>
  {children}
</motion.div>
```

### Loading Bar

Thin progress bar at viewport top during route transitions:

```css
.route-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #78FF9E, transparent);
  z-index: 80;
  animation: loadingBar 1.5s ease-in-out infinite;
}

@keyframes loadingBar {
  0% { width: 0%; left: 0; }
  50% { width: 60%; left: 20%; }
  100% { width: 0%; left: 100%; }
}
```

### Reduced Motion

Instant swap — no transition:
```css
@media (prefers-reduced-motion: reduce) {
  .page-enter, .page-exit { animation: none; opacity: 1; transform: none; }
  .route-loading-bar { animation: none; }
}
```

---

## 7. Scroll-Triggered Reveal Sequences

Elements animate into view as the user scrolls. Uses `IntersectionObserver` to trigger.

### CSS Classes

```css
/* Base: hidden state */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}

/* Triggered: visible state */
.reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children using custom property */
.reveal-stagger > .reveal {
  transition-delay: calc(var(--stagger-index, 0) * 80ms);
}
```

### Stagger Rules

- Each child delays `80ms` from the previous
- Maximum total stagger cap: `800ms` (for groups > 10 items, cap at 10 × 80ms)
- Cards in grids: stagger by visual reading order (left-to-right, top-to-bottom)
- Set `--stagger-index` via inline style or JS

### React Implementation

```tsx
import { useIntersectionTrigger } from './useIntersectionTrigger';

function RevealSection({ children }: { children: React.ReactNode }) {
  const [ref, isInView] = useIntersectionTrigger(0.15, true);

  return (
    <div ref={ref} className="reveal-stagger">
      {React.Children.map(children, (child, i) => (
        <div
          className={`reveal ${isInView ? 'in-view' : ''}`}
          style={{ '--stagger-index': i } as React.CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
```

### Section-Level Reveals

For major page sections (hero → features → stats → footer):

```css
.section-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.section-reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 8. 3D Perspective Card Tilt

Interactive tilt effect inspired by Sorare card interactions. Full implementation in `component-style-guide.md` §9.

### Quick CSS Reference

```css
.tilt-container { perspective: 1000px; }
.tilt-card {
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}
/* On mouseleave: transition 0.4s spring-gentle back to rotateX(0) rotateY(0) */
```

### Hook Reference

```tsx
const cardRef = useCardTilt(8); // max 8 degree rotation
// Attach: <div ref={cardRef} className="tilt-card">
```

### Performance Notes

- `mousemove` runs at display refresh rate (no throttling needed)
- `will-change: transform` applied during interaction, removed on leave
- Disabled on `pointer: coarse` (touch devices)
- Disabled when `prefers-reduced-motion: reduce`

---

## 9. Spring Physics Easing Curves

Replace standard `ease-out` with physics-based springs for organic motion.

### Named Curves

| Name | CSS Value | Feel | Duration Pairing |
|------|-----------|------|-----------------|
| `spring-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot + settle | 400ms |
| `spring-gentle` | `cubic-bezier(0.22, 1, 0.36, 1)` | Smooth deceleration | 300-500ms |
| `spring-snappy` | `cubic-bezier(0.16, 1, 0.3, 1)` | Quick snap | 150-200ms |

### Usage Matrix

| Interaction | Curve | Duration | Example |
|------------|-------|----------|---------|
| Badge reveal | `spring-bounce` | 400ms | Achievement popup, rank badge |
| Card hover lift | `spring-gentle` | 300ms | `-translate-y-1` on hover |
| Card tilt reset | `spring-gentle` | 400ms | Return to flat on mouseleave |
| Button press | `spring-snappy` | 150ms | `scale(0.98)` on active |
| Chip toggle | `spring-snappy` | 200ms | Filter chip active state |
| Drawer open | `spring-gentle` | 400ms | Slide-in panel |
| Drawer close | `ease-in` | 200ms | Fast exit (no spring) |
| Toast enter | `spring-gentle` | 200ms | Slide + fade in |
| Modal enter | `spring-bounce` | 350ms | Scale + fade in |

### Tailwind Config Addition

```typescript
// Add to tailwind.config.ts > theme > extend
transitionTimingFunction: {
  'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'spring-gentle': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'spring-snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
},
```

Usage: `transition-all duration-300 ease-spring-gentle`

---

## 10. Parallax Depth Effects

Background layers move at reduced scroll speed relative to content.

### CSS Implementation

```css
.parallax-container {
  position: relative;
  overflow: hidden;
}

.parallax-bg {
  position: absolute;
  inset: -20%; /* Extra space for movement */
  transform: translateY(calc(var(--scroll-progress, 0) * -60px));
  will-change: transform;
  z-index: 0;
}

.parallax-content {
  position: relative;
  z-index: 1;
}
```

### React Hook — `useParallax`

```tsx
import { useEffect, useRef } from 'react';

export function useParallax(speed = 0.3) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Disable on mobile and reduced motion
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        const progress = (viewHeight - rect.top) / (viewHeight + rect.height);
        const clamped = Math.max(0, Math.min(1, progress));
        el.style.setProperty('--scroll-progress', String(clamped));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return containerRef;
}
```

### Usage Rules

- **Hero sections only**: 0.3x scroll speed for background layer
- **Desktop only**: disabled on touch (`pointer: coarse`)
- **Reduced motion**: disabled, background stays static
- **Max displacement**: 60px (prevents content from visually disconnecting)
- **Performance**: only `transform` animated, `will-change: transform` on parallax layer

---

## 11. Cursor-Following Magnetic Buttons

Primary CTA buttons subtly attract toward the cursor when nearby.

### React Hook — `useMagneticButton`

```tsx
import { useCallback, useEffect, useRef } from 'react';

export function useMagneticButton(radius = 80, strength = 4) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMove = useCallback((e: MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < radius) {
      const pull = (1 - distance / radius) * strength;
      btn.style.transform = `translate(${distX * pull / radius}px, ${distY * pull / radius}px)`;
    } else {
      btn.style.transform = 'translate(0, 0)';
    }
  }, [radius, strength]);

  const handleLeave = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
    btn.style.transform = 'translate(0, 0)';
    setTimeout(() => {
      if (btn) btn.style.transition = 'transform 0.1s ease-out';
    }, 300);
  }, []);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    // Desktop only
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Listen on parent to detect approach
    const parent = btn.parentElement || document.body;
    parent.addEventListener('mousemove', handleMove);
    parent.addEventListener('mouseleave', handleLeave);

    return () => {
      parent.removeEventListener('mousemove', handleMove);
      parent.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMove, handleLeave]);

  return buttonRef;
}
```

### Constraints

- **Max displacement:** 4px (subtle pull, not dramatic drag)
- **Activation radius:** 80px from button center
- **Desktop only:** disabled on touch and reduced motion
- **Apply to:** Primary CTA buttons only (1 per section maximum)
- **Reset easing:** `spring-gentle` (0.3s)

---

## 12. Animated Gradient Borders

Rotating conic gradient for featured/live cards. Uses CSS `@property`.

### CSS Implementation

```css
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.gradient-border {
  position: relative;
  border-radius: 12px;
  /* Card content sits above the border pseudo-element */
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--angle),
    #8B5CF6,
    #78FF9E,
    #6D28D9,
    #78FF9E,
    #8B5CF6
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Activate on hover or featured state */
.gradient-border:hover::before,
.gradient-border.is-live::before,
.gradient-border.is-featured::before {
  opacity: 1;
  animation: borderRotate 4s linear infinite;
}

@keyframes borderRotate {
  to { --angle: 360deg; }
}
```

### Usage Rules

- **Hover-activated:** On player cards, kit cards (reveals on hover, fades on leave)
- **Persistent:** On live-match cards, featured/premium content
- **Never on:** Navigation, buttons, form inputs, table rows
- **Reduced motion:** Static gradient (no rotation), `animation: none`

---

## 13. Stat Counter Cascade (Slot Machine Effect)

Enhanced count-up where each digit rolls independently.

### Implementation

```tsx
import { useState, useEffect, useRef } from 'react';

export function useDigitCascade(
  target: number,
  duration = 800,
  shouldAnimate = true
) {
  const [displayDigits, setDisplayDigits] = useState<string[]>([]);
  const targetStr = String(target);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayDigits(targetStr.split(''));
      return;
    }

    const digits = targetStr.split('');
    const totalDigits = digits.length;

    // Animate each digit with staggered timing
    digits.forEach((digit, index) => {
      const staggerDelay = index * 50; // 50ms per digit
      const digitDuration = duration - (index * 30); // Slightly faster for later digits

      setTimeout(() => {
        const startTime = performance.now();
        const targetNum = parseInt(digit, 10);

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / digitDuration, 1);
          // Spring overshoot
          const eased = progress < 0.7
            ? (progress / 0.7) * (targetNum * 1.15)
            : targetNum + (targetNum * 0.15) * (1 - (progress - 0.7) / 0.3);

          const currentDigit = Math.min(Math.round(eased), targetNum);

          setDisplayDigits(prev => {
            const next = [...prev];
            next[index] = String(currentDigit);
            return next;
          });

          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      }, staggerDelay);
    });

    // Initialize with zeros
    setDisplayDigits(new Array(totalDigits).fill('0'));
  }, [target, duration, shouldAnimate, targetStr]);

  return displayDigits;
}
```

### CSS for Rolling Digit

```css
.digit-slot {
  display: inline-block;
  overflow: hidden;
  height: 1em;
  line-height: 1;
  vertical-align: bottom;
}

.digit-value {
  display: block;
  animation: digitRoll 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes digitRoll {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  70% {
    transform: translateY(-8%);
    opacity: 1;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Usage

- Apply to hero stat counters, podium scores, gameweek totals
- Each digit has `50ms` stagger (e.g., 4-digit number cascades over 200ms)
- Decimal points and commas stay fixed (only digits roll)
- Trigger via `IntersectionObserver` (existing `useIntersectionTrigger` hook)

---

## Updated Animation Timing Reference (v2.0)

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Skeleton shimmer | 1.5s (infinite) | `ease-in-out` | Component mount |
| Animated counter | 800ms | `ease-out` (cubic) | IntersectionObserver |
| Counter stagger | +150ms per sibling | — | Sequential delay |
| Digit cascade stagger | +50ms per digit | `spring-bounce` | IntersectionObserver |
| Toast enter | 200ms | `spring-gentle` | User action |
| Toast exit | 150ms | `ease-in` | Auto-dismiss |
| Badge reveal | 400ms | `spring-bounce` | Milestone hit |
| Card glow pulse | 2s (infinite) | `ease-in-out` | Haul event |
| Progress bar fill | 700ms | `ease-out` | Data load |
| Hover lift | 300ms | `spring-gentle` | Mouse enter |
| Active press | 150ms | `spring-snappy` | Mouse down |
| Page enter | 200ms | `ease-out` | Route change |
| Page exit | 100ms | `ease-in` | Route change |
| Section reveal | 500ms | `spring-gentle` | IntersectionObserver |
| Card stagger | +80ms per child | — | Sequential (in reveal) |
| 3D tilt tracking | 0.1s | `ease-out` | `mousemove` |
| 3D tilt reset | 0.4s | `spring-gentle` | `mouseleave` |
| Magnetic pull | 0.1s | `ease-out` | `mousemove` |
| Magnetic reset | 0.3s | `spring-gentle` | `mouseleave` |
| Gradient border rotate | 4s (infinite) | `linear` | Hover / live state |
| Parallax scroll | continuous | `passive scroll` | Scroll event |

---

*Part of the FR-DLS (FPL Ranker Design Language System) v2.0. Cross-reference with `docs/design/design-system.md` and `docs/design/component-style-guide.md`.*
