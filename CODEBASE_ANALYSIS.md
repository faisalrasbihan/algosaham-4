# Codebase Analysis Report
## Redundancy, Inefficiency, and Unused Libraries

Generated: 2026-02-03

---

## 🚨 Critical Issues

### 1. **Unused Dependencies (30 packages - ~2.5MB)**

The following npm packages are installed but **never imported or used** in your codebase:

#### UI Components (Radix UI - 18 packages)
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-switch`
- `@radix-ui/react-toast`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`

#### Form Libraries (2 packages)
- `@hookform/resolvers`
- `react-hook-form`

#### Date/Time Libraries (2 packages)
- `date-fns`
- `react-day-picker`

#### Other Utilities (8 packages)
- `@vercel/analytics` - Analytics not implemented
- `embla-carousel-react` - Carousel not used
- `geist` - Font not used
- `input-otp` - OTP input not used
- `next-themes` - Theme switching not used
- `react-resizable-panels` - Resizable panels not used
- `recharts` - Charts library not used (you're using lightweight-charts instead)
- `vaul` - Drawer component not used

**Impact:** These unused packages add unnecessary weight to your `node_modules` (~2.5MB) and increase installation time.

**Recommendation:** Remove all unused packages to reduce bundle size and improve build performance.

---

## ⚠️ Major Code Redundancy Issues

### 2. **Duplicate Strategy Builder Components (2,746 lines)**

You have **TWO nearly identical strategy builder components**:

1. **`components/backtest-strategy-builder.tsx`** (1,740 lines)
   - Used in `/app/backtest/page.tsx`
   - Has AI chat interface
   - Has onboarding tutorial
   - More feature-rich

2. **`components/strategy-builder.tsx`** (1,006 lines)
   - **NOT USED ANYWHERE** in the codebase
   - Simpler version without AI chat
   - Duplicate logic for indicators, filters, etc.

**Code Overlap:** ~70% of the code is duplicated between these two files:
- Indicator management logic
- Market cap/sector filtering
- Parameter editing
- Backtest configuration building

**Impact:** 
- 1,006 lines of dead code
- Maintenance burden (changes need to be made in two places)
- Confusing for developers

**Recommendation:** 
- **Delete** `components/strategy-builder.tsx` (it's not used)
- Extract shared logic into reusable hooks/utilities:
  - `useIndicators()` - Manage fundamental/technical indicators
  - `useFilters()` - Manage market cap, sector, ticker filters
  - `useBacktestConfig()` - Build backtest configuration

---

### 3. **Duplicate Strategy Card Components (697 lines)**

You have **FOUR strategy card components** with significant code duplication:

1. **`components/cards/marketplace-strategy-card.tsx`** (181 lines)
2. **`components/cards/regular-strategy-card.tsx`** (168 lines)
3. **`components/cards/showcase-strategy-card.tsx`** (162 lines)
4. **`components/cards/subscribed-strategy-card.tsx`** (188 lines)

**Code Overlap:** ~80% of the rendering logic is identical:
- Strategy metrics display (return, drawdown, win rate, Sharpe ratio)
- Tooltip components
- Grid layouts
- Styling patterns

**Differences:**
- Action buttons (Subscribe vs Edit/Delete vs View)
- Badge displays (subscriber count vs subscription status)
- Minor styling variations

**Impact:**
- ~500 lines of duplicated code
- Inconsistent updates (fixing a bug requires changing 4 files)
- Harder to maintain consistent UI

**Recommendation:**
Create a **single base component** with composition:

```tsx
// components/cards/base-strategy-card.tsx
export function BaseStrategyCard({ 
  strategy, 
  badges, 
  actions,
  className 
}: BaseStrategyCardProps) {
  // Shared rendering logic
}

// Then use it:
<BaseStrategyCard 
  strategy={strategy}
  badges={<SubscriberBadge count={strategy.subscribers} />}
  actions={<SubscribeButton />}
/>
```

This would reduce ~500 lines of code to ~200 lines.

---

### 4. **Empty/Unused Directories**

- **`app/api/backtest-alt/`** - Empty directory, no files
  - Not referenced anywhere in the codebase

**Recommendation:** Delete the empty directory.

---

### 5. **Missing Dependency**

- **`eslint-config-next`** - Required by `.eslintrc.json` but not installed

**Recommendation:** Add to package.json:
```bash
npm install --save-dev eslint-config-next
```

---

## 📊 Code Duplication Statistics

| Component Type | Files | Total Lines | Duplicate Lines | Efficiency Gain |
|---------------|-------|-------------|-----------------|-----------------|
| Strategy Builders | 2 | 2,746 | ~1,000 | 36% reduction |
| Strategy Cards | 4 | 697 | ~500 | 72% reduction |
| **Total** | **6** | **3,443** | **~1,500** | **44% reduction** |

---

## 🎯 Optimization Opportunities

### 6. **API Service Logging**

`lib/api.ts` has **extensive console.log statements** (20+ logs per request):
- Lines 136-188: Detailed request/response logging
- Lines 193-250: Backtest-specific logging

**Impact:**
- Performance overhead in production
- Cluttered console in development
- Potential security risk (logging sensitive data)

**Recommendation:**
- Use a proper logging library (e.g., `pino`, `winston`)
- Add environment-based log levels
- Remove or gate logs behind `process.env.NODE_ENV === 'development'`

---

### 7. **Inline Tooltip Components**

Strategy card components have **inline tooltip implementations** repeated 12+ times:

```tsx
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
  {tooltipText}
</div>
```

**Recommendation:**
- Use the existing `@/components/ui/tooltip` component
- Or create a reusable `<InfoTooltip>` component

---

## 📦 Bundle Size Impact

### Current Unused Dependencies Size Estimate:
- Radix UI components: ~1.2MB
- Form libraries: ~400KB
- Date libraries: ~300KB
- Other utilities: ~600KB
- **Total: ~2.5MB**

### Code Duplication Impact:
- Duplicate components: ~1,500 lines
- Estimated bundle impact: ~50-80KB (minified)

---

## ✅ Action Plan (Priority Order)

### High Priority (Do First)
1. ✅ **Remove unused npm packages** (saves 2.5MB, 5 min)
   ```bash
   npm uninstall @radix-ui/react-accordion @radix-ui/react-alert-dialog \
     @radix-ui/react-aspect-ratio @radix-ui/react-avatar \
     @radix-ui/react-checkbox @radix-ui/react-collapsible \
     @radix-ui/react-context-menu @radix-ui/react-hover-card \
     @radix-ui/react-menubar @radix-ui/react-navigation-menu \
     @radix-ui/react-progress @radix-ui/react-radio-group \
     @radix-ui/react-separator @radix-ui/react-slider \
     @radix-ui/react-switch @radix-ui/react-toast \
     @radix-ui/react-toggle @radix-ui/react-toggle-group \
     @hookform/resolvers react-hook-form date-fns \
     react-day-picker @vercel/analytics embla-carousel-react \
     geist input-otp next-themes react-resizable-panels \
     recharts vaul
   ```

2. ✅ **Delete unused strategy-builder.tsx** (saves 1,006 lines, 2 min)
   ```bash
   rm components/strategy-builder.tsx
   ```

3. ✅ **Delete empty directory** (1 min)
   ```bash
   rm -rf app/api/backtest-alt
   ```

4. ✅ **Add missing ESLint config** (2 min)
   ```bash
   npm install --save-dev eslint-config-next
   ```

### Medium Priority (Do Next)
5. 🔄 **Refactor strategy cards** (2-3 hours)
   - Create `BaseStrategyCard` component
   - Refactor 4 card variants to use base
   - Test all card use cases

6. 🔄 **Extract strategy builder logic** (3-4 hours)
   - Create `useIndicators` hook
   - Create `useFilters` hook
   - Create `useBacktestConfig` hook
   - Refactor `backtest-strategy-builder.tsx` to use hooks

### Low Priority (Nice to Have)
7. 🔄 **Optimize API logging** (1 hour)
   - Add environment-based logging
   - Remove production logs

8. 🔄 **Create reusable tooltip component** (30 min)
   - Extract inline tooltips to component
   - Replace all instances

---

## 📈 Expected Results

After implementing all recommendations:

- **Bundle size reduction:** ~2.5MB (node_modules) + ~50KB (code)
- **Code reduction:** ~1,500 lines removed
- **Maintenance improvement:** 44% less duplicate code
- **Build time improvement:** ~10-15% faster
- **Developer experience:** Clearer codebase structure

---

## 🔍 Currently Used Libraries

For reference, here are the libraries you **are** actively using:

### Core Framework
- `next` - Next.js framework
- `react` - React library
- `react-dom` - React DOM

### UI Components (Radix UI - Actually Used)
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`

### Styling
- `tailwindcss` - CSS framework
- `tailwind-merge` - Merge Tailwind classes
- `tailwindcss-animate` - Animations
- `class-variance-authority` - Component variants
- `clsx` - Class name utility

### Authentication
- `@clerk/nextjs` - Clerk authentication

### Database
- `drizzle-orm` - ORM
- `postgres` - PostgreSQL client

### Charts
- `lightweight-charts` - Trading charts

### Icons & UI
- `lucide-react` - Icon library
- `cmdk` - Command menu
- `sonner` - Toast notifications
- `driver.js` - Onboarding tours

### Validation
- `zod` - Schema validation

---

## 📝 Notes

- This analysis was performed using `depcheck` and manual code inspection
- All file paths are relative to project root
- Line counts include comments and whitespace
- Bundle size estimates are approximate
