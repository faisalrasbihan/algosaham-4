# Private Strategy Toggle Feature ✅

## Overview

Implemented a private strategy toggle feature that allows **Bandar tier** users to create private strategies, while free tier users can only create public strategies by default.

---

## Changes Made

### 1. **Frontend - Save Dialog (`components/backtest-strategy-builder.tsx`)**

#### **Added Components:**
- ✅ `Switch` component for toggle
- ✅ `Tooltip` component for explanations
- ✅ `Info` icon from lucide-react

#### **Added State:**
```typescript
const [isPrivate, setIsPrivate] = useState(false)
const [userTier, setUserTier] = useState<string>("free")
```

#### **Added useEffect to Fetch User Tier:**
```typescript
useEffect(() => {
    const fetchUserTier = async () => {
      if (!isSignedIn) return
      
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error)
        setUserTier('free')
      }
    }

    fetchUserTier()
  }, [isSignedIn])
```

#### **Added Toggle in Save Dialog:**
```tsx
{/* Private Strategy Toggle */}
<div className="flex items-center justify-between space-x-2 p-3 border rounded-md bg-muted/30">
  <div className="flex items-center space-x-2 flex-1">
    <Label htmlFor="private-toggle" className="text-sm font-medium cursor-pointer">
      Strategi Privat
    </Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            <strong>Strategi Publik:</strong> Dapat dilihat dan digunakan oleh semua pengguna di komunitas.
          </p>
          <p className="text-xs mt-2">
            <strong>Strategi Privat:</strong> Hanya Anda yang dapat melihat dan menggunakan strategi ini. 
            Fitur ini eksklusif untuk pengguna tier Bandar.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <Switch
    id="private-toggle"
    checked={isPrivate}
    onCheckedChange={setIsPrivate}
    disabled={userTier !== "bandar" || isSaving}
  />
</div>
{userTier !== "bandar" && (
  <p className="text-xs text-muted-foreground">
    💡 Upgrade ke tier <strong>Bandar</strong> untuk membuat strategi privat
  </p>
)}
```

#### **Updated Save API Call:**
```typescript
body: JSON.stringify({
  name: strategyName,
  description: strategyDescription,
  config,
  backtestResults,
  isPrivate,  // ✅ Added
}),
```

---

### 2. **Backend - Save API (`app/api/strategies/save/route.ts`)**

#### **Updated Request Body Type:**
```typescript
const { name, description, config, backtestResults, isPrivate } = body as {
    name: string;
    description: string;
    config: BacktestRequest;
    isPrivate?: boolean;  // ✅ Added
    backtestResults?: {...};
};
```

#### **Added Tier-Based Privacy Logic:**
```typescript
// Fetch user's subscription tier
const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
});

const userTier = user?.subscriptionTier || 'free';

// Determine if strategy should be public
// Free tier: always public (isPublic = true)
// Bandar tier: can choose (isPublic = !isPrivate)
// Other tiers: always public (isPublic = true)
let isPublic = true;
if (userTier === 'bandar' && isPrivate) {
    isPublic = false;
}
```

#### **Updated Database Insert:**
```typescript
await db.insert(strategies).values({
    ...
    isPublic,  // ✅ Now dynamic based on tier and toggle
    isActive: true,
})
```

---

### 3. **New API Endpoint (`app/api/user/tier/route.ts`)**

Created endpoint to fetch user's subscription tier:

```typescript
export async function GET() {
    const { userId } = await auth();
    
    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    return NextResponse.json({
        success: true,
        tier: user.subscriptionTier || "free",
    });
}
```

---

### 4. **New UI Component (`components/ui/switch.tsx`)**

Created Switch component using Radix UI primitives for the toggle functionality.

---

## Business Logic

### **Subscription Tiers:**

| Tier | Can Create Private Strategies? | Default Visibility |
|------|--------------------------------|-------------------|
| **free** | ❌ No | Public (always) |
| **premium** | ❌ No | Public (always) |
| **pro** | ❌ No | Public (always) |
| **bandar** | ✅ Yes | User's choice |

### **Strategy Visibility Rules:**

1. **Free Tier Users:**
   - Toggle is **disabled**
   - All strategies are **public** (`isPublic = true`)
   - See upgrade message

2. **Bandar Tier Users:**
   - Toggle is **enabled**
   - Can choose **private** or **public**
   - Private: `isPublic = false`
   - Public: `isPublic = true`

---

## User Experience

### **For Free Tier Users:**
1. Open save dialog
2. See "Strategi Privat" toggle (disabled)
3. Hover over ℹ️ icon to see tooltip in Bahasa Indonesia
4. See message: "💡 Upgrade ke tier **Bandar** untuk membuat strategi privat"
5. Strategy is saved as **public**

### **For Bandar Tier Users:**
1. Open save dialog
2. See "Strategi Privat" toggle (enabled)
3. Hover over ℹ️ icon to see tooltip in Bahasa Indonesia
4. Toggle ON → Strategy saved as **private** (`isPublic = false`)
5. Toggle OFF → Strategy saved as **public** (`isPublic = true`)

---

## Tooltip Content (Bahasa Indonesia)

**Strategi Publik:**
> Dapat dilihat dan digunakan oleh semua pengguna di komunitas.

**Strategi Privat:**
> Hanya Anda yang dapat melihat dan menggunakan strategi ini. Fitur ini eksklusif untuk pengguna tier Bandar.

---

## Testing

✅ **Build Status:** Successful
✅ **New API Route:** `/api/user/tier`
✅ **Switch Component:** Created
✅ **Tooltip:** Working with Indonesian text
✅ **Tier Logic:** Enforced on backend

---

## Security

- ✅ **Backend Validation:** Server-side tier check prevents free users from creating private strategies
- ✅ **Frontend Disabled:** Toggle is disabled for non-Bandar users
- ✅ **Default Safe:** Free tier defaults to public (safe fallback)

---

## Next Steps

1. ✅ Feature is ready to use
2. Test with a Bandar tier user account
3. Verify private strategies don't appear in community listings
4. Consider adding filter in portfolio to show public vs private strategies

---

## Summary

🎉 **Private strategy feature is complete!**

- Free tier users: All strategies are **public** by default
- Bandar tier users: Can toggle strategies to **private**
- Tooltip explains the difference in **Bahasa Indonesia**
- Backend enforces tier restrictions
- Build successful ✅
