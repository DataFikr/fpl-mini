# Remaining Tasks for FPLRanker Updates

## High Priority Tasks

### 1. Hero Section Improvements (src/app/page.tsx)
**Status**: Partially Complete
**Estimated Time**: 30 minutes

**Tasks**:
- [ ] Remove TeamSearch component completely
- [ ] Implement simple input field aligned to the left with Search button
- [ ] Add "Not sure what is your team ID? Find Team ID here" button linking to `/find-team-id`
- [ ] Remove "Start Free Trial" and "Watch Demo Video" buttons
- [ ] Rearrange badge section: "Live FPL Data", "Instant Analytics", "100% Free" with equal gaps (use `gap-8` or `justify-between`)

**Files to Modify**:
- `src/app/page.tsx` (lines 69-112)

**Example Code**:
```tsx
<div className="mb-8 max-w-4xl">
  <div className="flex flex-col sm:flex-row gap-4 items-start">
    <div className="relative flex-1 w-full">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        placeholder="Enter FPL Manager ID..."
        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-black"
      />
    </div>
    <button className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700">
      Search
    </button>
  </div>
  <div className="mt-4">
    <Link href="/find-team-id" className="inline-flex items-center gap-2 text-fpl-accent hover:text-fpl-violet-400">
      <span>Not sure what is your team ID?</span>
      <span className="underline font-semibold">Find Team ID here</span>
    </Link>
  </div>
</div>

<div className="flex flex-wrap justify-between gap-8 max-w-2xl">
  {/* Badges */}
</div>
```

---

### 2. Remove "Ever Wondered About Your League?" Section
**Status**: Not Started
**Estimated Time**: 5 minutes

**Tasks**:
- [ ] Remove the entire "Ever Wondered" section with question cards
- [ ] Remove lines ~149-206 in src/app/page.tsx

**Files to Modify**:
- `src/app/page.tsx`

---

### 3. Footer Design Update (src/components/ui/footer.tsx)
**Status**: Social media updated, layout needs work
**Estimated Time**: 45 minutes

**Tasks**:
- [ ] Remove Features column (Live Standings, Progression, Rivals)
- [ ] Under Company: Keep "About Us", remove "Blog (future)" and "Careers (opt)"
- [ ] Under Support: Keep "Contact", remove "FAQ (future)" and "Help Center"
- [ ] Under Legal: Keep "Privacy", remove "Terms" and "Cookies"
- [ ] Reorganize to 3 columns (Company, Support, Legal) centered
- [ ] Ensure footer uses same design pattern as landing page (backdrop-blur-fpl, rounded-fpl, etc.)

**Files to Modify**:
- `src/components/ui/footer.tsx` (lines 96-137)

**New Structure**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
  {/* Company Column */}
  <div className="text-center">
    <h3 className="font-semibold text-lg mb-4 text-yellow-300">Company</h3>
    <ul className="space-y-2 text-sm">
      <li><Link href="/about" className="hover:text-yellow-300 transition-colors">About Us</Link></li>
    </ul>
  </div>

  {/* Support Column */}
  <div className="text-center">
    <h3 className="font-semibold text-lg mb-4 text-yellow-300">Support</h3>
    <ul className="space-y-2 text-sm">
      <li><Link href="/contact" className="hover:text-yellow-300 transition-colors">Contact</Link></li>
    </ul>
  </div>

  {/* Legal Column */}
  <div className="text-center">
    <h3 className="font-semibold text-lg mb-4 text-yellow-300">Legal</h3>
    <ul className="space-y-2 text-sm">
      <li><Link href="/privacy" className="hover:text-yellow-300 transition-colors">Privacy</Link></li>
    </ul>
  </div>
</div>
```

---

### 4. Update Static Pages Design
**Status**: Not Started
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Update Contact page (`src/app/contact/page.tsx`) to match landing page design
- [ ] Update About Us page (`src/app/about/page.tsx`) to match landing page design
- [ ] Update Privacy page (`src/app/privacy/page.tsx`) to match landing page design
- [ ] Use Header and Footer components
- [ ] Apply backdrop-blur-fpl, rounded-fpl, gradient patterns
- [ ] Ensure mobile responsiveness

**Design Pattern to Apply**:
```tsx
export default function PageName() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <main className="container mx-auto px-4 py-20">
          <section className="max-w-4xl mx-auto backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
            {/* Page Content */}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
```

---

## Medium Priority Tasks

### 5. Fix League Progression Tooltip Positioning
**Status**: Not Started
**Estimated Time**: 1 hour

**Issue**: Tooltip modal showing team info, GW rank, total rank appears outside screen bounds

**Tasks**:
- [ ] Find the league progression chart component (likely uses Recharts)
- [ ] Implement boundary detection for tooltip
- [ ] Adjust tooltip position to stay within viewport
- [ ] Test on different screen sizes

**Files to Investigate**:
- Search for: `progression`, `chart`, `Recharts`, `tooltip`
- Likely in: `src/components/league/` or `src/app/league/[id]/`

**Solution Pattern**:
```tsx
// Add boundary check
const adjustTooltipPosition = (x: number, y: number, width: number, height: number) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let adjustedX = x;
  let adjustedY = y;

  // Check right boundary
  if (x + width > viewportWidth) {
    adjustedX = viewportWidth - width - 20;
  }

  // Check bottom boundary
  if (y + height > viewportHeight) {
    adjustedY = viewportHeight - height - 20;
  }

  // Check left boundary
  if (adjustedX < 0) {
    adjustedX = 20;
  }

  // Check top boundary
  if (adjustedY < 0) {
    adjustedY = 20;
  }

  return { x: adjustedX, y: adjustedY };
};
```

---

### 6. Fix Head-to-Head Leader/Chaser Assignment
**Status**: Not Started
**Estimated Time**: 30 minutes

**Issue**: Leader and chaser teams are incorrectly assigned in head-to-head banter
**Reference Image**: `C:\Users\Family\Downloads\web_project\web_project\leader_chaser.png`

**Tasks**:
- [ ] Read the reference image to understand correct logic
- [ ] Find head-to-head banter component
- [ ] Fix team assignment logic (leader should be ahead, chaser behind)
- [ ] Test with different rank scenarios

**Files to Investigate**:
- Search for: `leader`, `chaser`, `head-to-head`, `banter`
- Likely in: `src/components/league/` or headline generation logic

---

### 7. Make League Progression Chart Sticky on Desktop
**Status**: Not Started
**Estimated Time**: 30 minutes

**Issue**: Chart scrolls away when viewing league table below

**Tasks**:
- [ ] Find league progression chart component
- [ ] Implement sticky positioning for desktop only
- [ ] Use `position: sticky` or custom scroll listener
- [ ] Ensure it only applies on desktop (min-width: 768px or 1024px)
- [ ] Test scroll behavior with long league tables

**Files to Investigate**:
- League page component with progression chart

**Solution Pattern**:
```tsx
<div className="lg:sticky lg:top-20 lg:z-10">
  {/* Chart Component */}
</div>
```

Or with custom scroll:
```tsx
const [isSticky, setIsSticky] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const chartOffset = chartRef.current?.offsetTop || 0;
    setIsSticky(scrollY > chartOffset);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## Low Priority / Enhancement Tasks

### 8. Landing Page Cleanup
**Status**: Not Started
**Estimated Time**: 15 minutes

**Tasks**:
- [ ] Remove unused `QuestionCard` component (no longer used after removing "Ever Wondered" section)
- [ ] Clean up unused imports
- [ ] Verify all section IDs are correctly linked from header

---

## Testing Checklist

After completing each task, verify:

- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Navigation links work correctly
- [ ] All images load properly
- [ ] Forms submit correctly
- [ ] Tooltips/modals appear within screen bounds
- [ ] Sticky elements behave correctly
- [ ] No console errors
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Deployment Steps

After completing all tasks:

1. Test locally: `npm run dev`
2. Build: `npm run build`
3. Fix any build errors
4. Commit changes: `git add . && git commit -m "Complete landing page and UX updates"`
5. Push: `git push`
6. Deploy to Vercel (automatic if connected to GitHub)
7. Test production site
8. Monitor for errors in Vercel dashboard

---

## Notes

- Always maintain the FPLRanker design system (colors, fonts, shadows)
- Use existing components where possible
- Keep mobile-first responsive design
- Test on actual devices, not just browser DevTools
- Reference existing working pages for design patterns
- Check `src/app/globals.css` for custom Tailwind classes

---

## Questions to Resolve

1. **Leader/Chaser Logic**: Need to see `leader_chaser.png` to understand exact requirements
2. **Chart Component**: Which charting library is being used? (Recharts, Chart.js, Victory?)
3. **Static Pages Content**: What content should go in About Us, Contact, Privacy pages?
4. **Sticky Behavior**: Should chart stay sticky throughout entire scroll or just until certain point?

---

Last Updated: 2025-01-11
