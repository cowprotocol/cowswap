# UTM Attribution Loading System

## Problem

Analytics tools (Safary, GTM) cannot read UTM parameters after hash fragments in URLs. CowSwap's HashRouter causes URLs like `https://swap.cow.fi/?utm_source=Hypelab&utm_campaign=Hypelab-ads&utm_code=abc&utm_medium=ads` to become `https://swap.cow.fi/#/?utm_code=abc`, losing most UTM parameters and breaking attribution tracking.

**Impact**: Only 22 out of 5,000+ ad clicks were being tracked by Safary analytics.

## Solution

A comprehensive attribution loading system that ensures analytics tools capture UTM parameters before any navigation occurs:

### Components

1. **Attribution Loading Script** (`public/utm-fix.js`)

   - Detects UTM parameters on page load
   - Shows professional loading screen with "Preparing your experience..."
   - **Blocks React initialization** using global flag `window._utmAttributionInProgress`
   - Waits for both GTM (`dataLayer`) and Safary SDK to load
   - Stores UTM data in sessionStorage for React handoff
   - Redirects to clean URL once attribution is complete
   - Multiple timeout safeguards (5s normal, 10s hard timeout)

2. **Attribution Ready Hook** (`src/modules/utm/hooks.ts` - `useUtmAttributionReady`)

   - Monitors `window._utmAttributionInProgress` flag
   - Blocks React component initialization until attribution completes
   - Eliminates race conditions between attribution script and React

3. **UTM Initialization Hook** (`src/modules/utm/hooks.ts` - `useInitializeUtm`)
   - Waits for attribution completion before proceeding
   - Reads UTM data from sessionStorage (primary)
   - Falls back to URL parameters only for backward compatibility
   - Supports standard UTM parameters plus `utm_code` (Hypelab)

### Enhanced Analytics Detection

**GTM Detection:**

- `window.dataLayer` (primary indicator)
- `window.gtag` (fallback)
- `window.google_tag_manager` (fallback)

**Safary Detection:**

- `script[data-name="safary-sdk"]` (specific script injection)
- `window.safary` global object
- Generic `script[src*="safary"]` (fallback)

**Smart Timing Logic:**

- **Optimal**: Both GTM + Safary detected → Wait 1 second for attribution
- **GTM Only**: Wait 3 seconds for Safary, then proceed
- **Timeout**: 5 second limit to prevent user blocking

### Complete Flow

```
1. User clicks ad URL with UTM parameters
   ↓
2. utm-fix.js detects UTM params
   ↓
3. Loading screen appears instantly
   ↓
4. React initialization BLOCKED via global flag
   ↓
5. Wait for GTM dataLayer to appear
   ↓
6. Wait for Safary SDK script injection
   ↓
7. Both analytics ready → Give extra time for attribution capture
   ↓
8. Store UTM data in sessionStorage
   ↓
9. Clear global flag → UNBLOCK React
   ↓
10. Redirect to clean app URL (no UTM parameters)
    ↓
11. React starts → useUtmAttributionReady waits for completion
    ↓
12. useInitializeUtm reads UTM data from sessionStorage
    ↓
13. Clean app navigation with preserved attribution data
```

### Key Features

- ✅ **Guaranteed Attribution**: No race conditions between analytics and navigation
- ✅ **Professional UX**: Branded loading screen instead of blank page
- ✅ **Clean URLs**: Final URLs have no UTM parameters for clean sharing
- ✅ **Robust Error Handling**: Multiple timeout levels prevent infinite loading
- ✅ **Backward Compatible**: Falls back to URL parameters if needed
- ✅ **Extended UTM Support**: Standard UTM + `utm_code` for Hypelab campaigns

### Files Modified

**Core Implementation:**

- `public/utm-fix.js` - Attribution loading system with React blocking
- `src/modules/utm/hooks.ts` - Attribution-aware hooks with sessionStorage
- `src/modules/utm/types.ts` - Added `utm_code` support

**Cleanup (old logic removed):**

- `src/pages/Swap/index.tsx` - Removed conflicting UTM preservation
- `src/legacy/pages/Swap/redirects.tsx` - Removed conflicting UTM preservation

### Expected Results

**Before Fix:**

- Safary tracking: 22/5,000+ clicks (0.4% attribution rate)
- UTM parameters lost during HashRouter redirects
- Analytics tools couldn't read parameters after `#`

**After Fix:**

- Expected: ~100% attribution rate
- All UTM parameters preserved for analytics
- Clean user experience with proper loading states
- No infinite redirect loops or race conditions

### Testing

Test with: `http://localhost:3000/?utm_source=Hypelab&utm_campaign=Hypelab-ads&utm_code=abc&utm_medium=ads`

**Expected Console Output:**

1. `[UTM Attribution] UTM parameters detected, starting attribution loading process`
2. `[UTM Attribution] Set flag to block React initialization`
3. `[UTM Hook] Waiting for attribution completion...`
4. `[UTM Attribution] Both GTM and Safary detected, giving extra time for attribution...`
5. `[UTM Attribution] Stored UTM data in sessionStorage`
6. `[UTM Attribution] Cleared flag - React can now initialize`
7. `[UTM Hook] Loading UTM data from attribution` (sessionStorage, not URL fallback!)

**Final Result:** Clean URL with all UTM attribution captured by analytics tools.
