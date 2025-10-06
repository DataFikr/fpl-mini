# FR-DLS Implementation Guide
## Continuing the Design Enhancement

This guide provides copy-paste code snippets to complete the FR-DLS design system implementation across FPLRanker.

---

## ✅ Already Completed

1. **Tailwind Config** - FR-DLS color palette, fonts, shadows added
2. **Layout** - Plus Jakarta Sans and Inter fonts installed
3. **Framer Motion** - npm package installed
4. **Design Tokens** - All custom classes available

---

## 🎯 Priority Components to Update

### 1. League Page Header Enhancement

**File**: `src/app/league/[id]/league-page-client.tsx`

Add after imports:
```tsx
import { motion } from 'framer-motion';
```

Replace the header section (around line 220-250) with:
```tsx
{/* Enhanced Header with Glassmorphism */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="bg-gradient-to-br from-fpl-primary via-fpl-violet-800 to-fpl-dark rounded-fpl shadow-fpl-glow-violet p-8 mb-6"
>
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div>
      <motion.h1
        className="text-4xl font-jakarta font-bold text-white mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {league.name}
      </motion.h1>
      <div className="flex items-center gap-4 text-fpl-text-secondary font-inter">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{league.standings.length} Teams</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>GW {league.currentGameweek}</span>
        </div>
      </div>
    </div>

    {/* Top 3 Quick View with Glow Effects */}
    <div className="flex gap-3">
      {topTeams.slice(0, 3).map((team, idx) => (
        <motion.div
          key={team.teamId}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + idx * 0.1 }}
          className={`
            backdrop-blur-fpl bg-white/10 rounded-fpl p-4 border
            ${idx === 0 ? 'border-fpl-accent shadow-fpl-glow' : 'border-white/20'}
          `}
        >
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2
            ${idx === 0 ? 'bg-gradient-to-br from-fpl-accent to-fpl-lime-600 text-fpl-dark shadow-fpl-glow' :
              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
              'bg-gradient-to-br from-orange-400 to-orange-500 text-white'}
          `}>
            {idx + 1}
          </div>
          <div className="text-white font-jakarta font-semibold text-sm">
            {team.teamName}
          </div>
          <div className="text-fpl-text-secondary font-inter text-xs">
            {team.totalPoints.toLocaleString()} pts
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div>
```

### 2. Tab Navigation with FR-DLS

Replace tab buttons (around line 260):
```tsx
<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
  {tabs.map((tab) => (
    <motion.button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-3 rounded-fpl font-jakarta font-semibold text-sm transition-all whitespace-nowrap
        flex items-center gap-2
        ${activeTab === tab.id
          ? 'bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white shadow-fpl-glow-violet'
          : 'bg-white/5 backdrop-blur-fpl text-fpl-text-secondary hover:bg-white/10 border border-white/10'
        }
      `}
    >
      <tab.icon className="h-4 w-4" />
      {tab.name}
    </motion.button>
  ))}
</div>
```

### 3. League Standings Table Enhancement

**File**: Create new component `src/components/league/enhanced-standings-table.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';

interface Standing {
  rank: number;
  teamName: string;
  managerName: string;
  totalPoints: number;
  rankChange?: number;
  lastRank?: number;
}

export function EnhancedStandingsTable({ standings }: { standings: Standing[] }) {
  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-fpl-accent" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-fpl-text-secondary" />;
  };

  return (
    <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl border border-fpl-primary/20 overflow-hidden">
      <table className="w-full">
        <thead className="bg-fpl-primary/30 border-b border-fpl-primary/20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Team</th>
            <th className="px-4 py-3 text-right text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Points</th>
            <th className="px-4 py-3 text-center text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Change</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const rankChange = team.lastRank ? team.lastRank - team.rank : 0;
            const isRising = rankChange > 0;
            const isFalling = rankChange < 0;

            return (
              <motion.tr
                key={team.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`
                  border-b border-fpl-primary/10 transition-all hover:bg-fpl-primary/10
                  ${isRising ? 'bg-fpl-accent/5' : isFalling ? 'bg-red-500/5' : ''}
                `}
              >
                {/* Rank Badge with Glow for Top 3 */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`
                      rounded-full w-10 h-10 flex items-center justify-center font-jakarta font-bold text-sm
                      ${team.rank === 1 ? 'bg-gradient-to-br from-fpl-accent to-fpl-lime-600 text-fpl-dark shadow-fpl-glow animate-glow' :
                        team.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                        team.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                        'bg-fpl-primary/20 text-fpl-text-secondary'}
                    `}>
                      {team.rank}
                    </div>
                    {team.rank === 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Crown className="h-5 w-5 text-fpl-accent" />
                      </motion.div>
                    )}
                  </div>
                </td>

                {/* Team Info */}
                <td className="px-4 py-4">
                  <div className="font-jakarta font-semibold text-white">
                    {team.teamName}
                  </div>
                  <div className="font-inter text-sm text-fpl-text-secondary">
                    {team.managerName}
                  </div>
                </td>

                {/* Points */}
                <td className="px-4 py-4 text-right">
                  <div className="font-jakarta font-bold text-lg text-white">
                    {team.totalPoints.toLocaleString()}
                  </div>
                </td>

                {/* Rank Change */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    {getRankChangeIcon(rankChange)}
                    {rankChange !== 0 && (
                      <span className={`
                        font-inter text-sm font-semibold
                        ${isRising ? 'text-fpl-accent' : isFalling ? 'text-red-400' : 'text-fpl-text-secondary'}
                      `}>
                        {Math.abs(rankChange)}
                      </span>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. Voting Poll Enhancement with Glassmorphism

**File**: `src/components/ui/voting-poll.tsx`

Update poll card styling (around line 240):
```tsx
<div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-6 border border-fpl-primary/20 shadow-fpl">
```

Update tab buttons (around line 240):
```tsx
className={`
  px-4 py-2 rounded-fpl text-sm font-jakarta font-semibold transition-all
  ${activeTab === pollId
    ? 'bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white shadow-fpl-glow-violet'
    : 'bg-white/5 text-fpl-text-secondary hover:bg-white/10 border border-white/10'
  }
`}
```

### 5. Dark Mode Background

**File**: `src/app/league/[id]/league-page-client.tsx`

Wrap the entire return content:
```tsx
return (
  <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark">
    <div className="container mx-auto px-4 py-8">
      {/* All existing content */}
    </div>
  </div>
);
```

### 6. Badge Cards with Glow

**File**: `src/components/ui/badges-achievements.tsx`

Update badge card styling:
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -5 }}
  className={`
    backdrop-blur-fpl rounded-fpl p-6 border shadow-fpl
    ${isUnlocked
      ? 'bg-gradient-to-br from-fpl-primary to-fpl-violet-700 border-fpl-accent shadow-fpl-glow'
      : 'bg-fpl-dark/40 border-fpl-primary/20 opacity-50'
    }
  `}
>
```

---

## 🎨 Global CSS Updates

**File**: `src/app/globals.css`

Add these utility classes at the end:
```css
@layer utilities {
  /* Glassmorphism utilities */
  .glass-card {
    @apply backdrop-blur-fpl bg-white/10 rounded-fpl border border-white/20;
  }

  .glass-card-dark {
    @apply backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20;
  }

  /* Text gradients */
  .text-gradient-primary {
    @apply bg-gradient-to-r from-fpl-accent to-fpl-lime-600 bg-clip-text text-transparent;
  }

  .text-gradient-violet {
    @apply bg-gradient-to-r from-fpl-violet-500 to-fpl-primary bg-clip-text text-transparent;
  }

  /* Animated backgrounds */
  .bg-animated-gradient {
    background: linear-gradient(45deg, #2B1654, #8B5CF6, #2B1654);
    background-size: 200% 200%;
    animation: gradientShift 8s ease infinite;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
}
```

---

## 🚀 Quick Wins

### Instant Visual Impact Changes:

1. **All Cards**: Add `backdrop-blur-fpl bg-fpl-dark/40 border-fpl-primary/20`
2. **All Buttons**: Use `rounded-fpl` instead of `rounded-lg`
3. **Primary Actions**: Use `bg-gradient-to-r from-fpl-primary to-fpl-violet-700`
4. **Success/Win States**: Use `text-fpl-accent` or `shadow-fpl-glow`
5. **Top Rankings**: Add `shadow-fpl-glow animate-glow`

---

## 📊 Performance-Based Dynamic Theming

Add this utility function to any component:
```tsx
const getPerformanceGradient = (rankChange: number) => {
  if (rankChange > 3) return 'from-fpl-accent via-fpl-lime-600 to-fpl-primary';
  if (rankChange > 0) return 'from-fpl-primary to-fpl-violet-700';
  if (rankChange < -3) return 'from-gray-800 to-gray-900';
  return 'from-fpl-dark to-fpl-primary/50';
};
```

---

## ✅ Testing Checklist

- [ ] Dark mode background applied
- [ ] Plus Jakarta Sans font rendering
- [ ] Glassmorphism cards visible
- [ ] Top 3 ranks have glow effects
- [ ] Tabs animate on click
- [ ] Rank changes show colored indicators
- [ ] Hover effects work smoothly
- [ ] Mobile responsive (cards stack)

---

## 🎯 Expected Visual Impact

Before: Generic light theme, flat design
After: Premium dark theme, depth with glassmorphism, competitive energy with violet + lime, smooth animations

---

This implementation transforms FPLRanker from a generic AI dashboard into a distinctive Fantasy Sports Intelligence Hub! 🚀
