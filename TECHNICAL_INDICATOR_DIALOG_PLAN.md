# Plan for Beautiful Categorized Technical Indicator Dialog

## 1. Overview
The goal is to transform the existing simple `AddIndicatorModal` into a comprehensive, beautiful, and categorized dialog for selecting technical indicators. The new design will feature a two-column layout with category navigation, a search bar, and a responsive grid of indicator cards.

## 2. Design Specifications

### Layout
- **Full-Screen Modal**: Uses a dark overlay (`fixed inset-0 bg-black/80`) to focus attention.
- **Two-Column Grid**: 
  - **Sidebar (Left)**: Category navigation with icons and counts. Width approx 240px-280px.
  - **Main Content (Right)**: Scrollable area containing the header (search) and the indicator grid.
- **Sticky Header**: Contains the search bar and close button, remaining visible while scrolling.

### Visual Style
- **Color Palette**:
  - Primary Accent: Orange (`#d07225`) - used for active states or primary actions.
  - Secondary Accents: Teal (`#8cbcb9`), Purple (`#8d6a9f`).
  - Background: Clean white/light gray (`bg-background` / `bg-muted/30`).
  - Cards: White (`bg-card`) with hover effects.
- **Typography**: `font-mono` for headers, clean sans-serif for body.
- **Icons**: pure `lucide-react` icons. **NO EMOJIS**.
- **Animations**:
  - Hover effects on cards (scale/lift).
  - Smooth transitions for category switching.

## 3. Component Architecture

### Data Structure
Refactor the `technicalIndicators` array into a grouped structure:

```typescript
type CategoryName = "Moving Average" | "Momentum" | "Volatility" | "Volume" | "Trend" | "Support/Resistance" | "Candlestick (Single)" | "Candlestick (Multi)" | "Chart Pattern" | "Chart Pattern (Imminent)" | "Foreign Flow (IDX)" | "ARA/ARB (IDX)";

interface IndicatorCategory {
  id: string;
  name: CategoryName;
  icon: LucideIcon;
  color: string; // Tailwind class or hex
  indicators: Indicator[];
}
```

### Main Component (`AddIndicatorModal`)
- **State**:
  - `selectedCategory`: string (default to "Moving Average").
  - `searchQuery`: string.
- **Derived State**:
  - `filteredIndicators`: Indicators matching the search query (if search is active, show results from all categories or grouped by category).

### Sub-Components (Internal)
1.  **`CategorySidebar`**:
    - Renders list of categories.
    - Shows generic "All Indicators" option (optional) or just the 12 categories.
    - Displays indicator count per category.
    - Highlights active category.
2.  **`IndicatorGrid`**:
    - Renders the grid of `IndicatorCard`s.
    - Columns: 1 on mobile, 2 on tablet, 3 on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
3.  **`IndicatorCard`**:
    - Displays Name, Brief Description.
    - Hover: Shows "Add" button and potentially more details.
    - Visuals: Colored left border matching the category color.

## 4. Implementation Steps

1.  **Define Categories & Data**: 
    - Create the `categories` configuration array mapping the 12 categories to their respective `lucide-react` icons and color themes.
    - Map the existing flat `technicalIndicators` list into these categories.
2.  **Scaffold the Layout**:
    - updates `DialogContent` to use `max-w-[90vw] h-[85vh]` for a large, comfortable view.
    - Implement the Sidebar + Main Content grid.
3.  **Implement Sidebar**:
    - Iterate through categories.
    - Add click handlers to update `selectedCategory`.
4.  **Implement Header & Search**:
    - Add `Input` for search.
    - Ensure search filters across all categories if typed, or just filter within category (global search is better UX).
5.  **Implement Indicator Grid**:
    - Map through `selectedCategory.indicators`.
    - Create the Card design with the requested aesthetics.
6.  **Refine & Polish**:
    - Add hover animations.
    - Verify "No Emoji" compliance.
    - Ensure responsive behavior.

## 5. Category to Icon Mapping (Lucide)
- **Moving Average**: `TrendingUp`
- **Momentum**: `Zap`
- **Volatility**: `Activity`
- **Volume**: `BarChart3`
- **Trend**: `TrendingUp` (or `LineChart`)
- **Support/Resistance**: `Layers`
- **Candlestick (Single)**: `CandlestickChart` (custom or `BarChart`) -> generic `ChartBar` if specific one unavailable.
- **Candlestick (Multi)**: `GalleryVerticalEnd` (looks like candles)
- **Chart Pattern**: `GitBranch`
- **Chart Pattern (Imminent)**: `Clock`
- **Foreign Flow (IDX)**: `Globe`
- **ARA/ARB (IDX)**: `AlertCircle`

## 6. Colors (Tailwind Classes)
- **Primary**: `text-orange-500` / `border-orange-500`
- **Secondary**: `text-teal-500` / `border-teal-500`
- **Tertiary**: `text-purple-500` / `border-purple-500`
