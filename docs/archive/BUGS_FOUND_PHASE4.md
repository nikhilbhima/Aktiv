# Phase 4 Bugs Found - Comprehensive Review

## Executive Summary

**4-pass review completed:**
- Pass 1: CRUD integration (useGoals)
- Pass 2: Matching logic (useMatches)
- Pass 3: Chat/Realtime (useChats)
- Pass 4: Async issues & edge cases

**Total Issues: 21 bugs**
- **Critical: 5** (Memory leak, security, N+1 queries)
- **High: 10** (Race conditions, performance issues)
- **Medium: 6** (State management, UX issues)

---

## Pass 1: CRUD Integration Bugs (useGoals.ts)

### Bug #1: Stale Supabase Client ⚠️ HIGH
**Location:** `src/hooks/useGoals.ts:11`
```typescript
const supabase = createClient(); // Created once on mount
```
**Issue:** Client created outside useEffect won't update when auth state changes
**Impact:** After token refresh, queries may fail with permission errors
**Fix:** Move client creation inside effect or use singleton pattern

### Bug #2: Missing useEffect Dependencies ⚠️ MEDIUM
**Location:** `src/hooks/useGoals.ts:21`
```typescript
useEffect(() => {
  fetchGoals(); // fetchGoals not in dependency array
}, [user]);
```
**Issue:** ESLint warning disabled, masking real dependency issue
**Impact:** Could cause stale closures if fetchGoals logic changes
**Fix:** Use useCallback for fetchGoals or include it in deps

### Bug #3: No Optimistic Delete Rollback ⚠️ HIGH
**Location:** `src/hooks/useGoals.ts:119`
```typescript
setGoals((prev) => prev.filter((goal) => goal.id !== goalId)); // Removed immediately
const { error } = await supabase.from('goals').delete()... // DB call after
```
**Issue:** If database delete fails, local state is wrong (goal appears deleted but isn't)
**Impact:** Data inconsistency - user thinks goal deleted but it still exists
**Fix:** Delete from state only after DB confirms success

### Bug #4: No Optimistic Update Rollback ⚠️ HIGH
**Location:** `src/hooks/useGoals.ts:92-93`
```typescript
setGoals((prev) => prev.map((goal) => (goal.id === goalId ? data : goal)));
```
**Issue:** Updates local state before DB update completes
**Impact:** If update fails, UI shows updated but DB has old data
**Fix:** Update state only after DB confirms, or implement rollback on error

---

## Pass 2: Matching Logic Bugs (useMatches.ts)

### Bug #5: N+1 Query Problem 🔴 CRITICAL
**Location:** `src/hooks/useMatches.ts:54-84, 101-131`
```typescript
const transformedMatches = await Promise.all(
  (data || []).map(async (match: any) => {
    const { data: userData } = await supabase.from('users')... // Query per match
    const { data: goalsData } = await supabase.from('goals')... // Another query per match
  })
);
```
**Issue:** 20 matches = 40 additional queries (1 + 2*20 = 41 total queries!)
**Impact:** VERY slow performance, could timeout, terrible user experience
**Fix:** Use Supabase's `select('*, users!inner(*), goals!inner(*)')` to join in single query

### Bug #6: Stale Supabase Client ⚠️ HIGH
**Location:** `src/hooks/useMatches.ts:20`
Same as Bug #1

### Bug #7: Missing useCallback Dependency ⚠️ MEDIUM
**Location:** `src/hooks/useMatches.ts:30`
Same pattern as Bug #2

### Bug #8: No Error Handling in Promise.all ⚠️ HIGH
**Location:** `src/hooks/useMatches.ts:54, 101`
```typescript
await Promise.all((data || []).map(async (match: any) => {
  const { data: userData, error: userError } = await supabase...
  if (userError) throw userError; // Throws, fails entire Promise.all
}));
```
**Issue:** If ONE user fetch fails (e.g., user deleted), ENTIRE match list fails
**Impact:** One bad record breaks the whole feed
**Fix:** Use Promise.allSettled or handle errors gracefully per match

### Bug #9: Code Duplication ⚠️ MEDIUM
**Location:** `src/hooks/useMatches.ts:54-85 vs 101-132`
**Issue:** Almost identical code blocks for IRL vs accountability modes
**Impact:** Bug fixes need to be applied twice, maintenance nightmare
**Fix:** Extract shared logic into helper function

### Bug #10: Potential Infinite Loop ⚠️ HIGH
**Location:** `src/hooks/useMatches.ts:168`
```typescript
await fetchMatches(); // Called after sendMatchRequest
```
**Issue:** fetchMatches not memoized, recreated every render → could trigger infinite useEffect
**Impact:** App freeze, excessive API calls
**Fix:** Use useCallback for fetchMatches

---

## Pass 3: Chat/Realtime Bugs (useChats.ts)

### Bug #11: Memory Leak - Multiple Realtime Subscriptions 🔴 CRITICAL
**Location:** `src/hooks/useChats.ts:31-65`
```typescript
useEffect(() => {
  const channel = supabase.channel('messages').on(...).subscribe();
  return () => supabase.removeChannel(channel);
}, [user]); // Only depends on user
```
**Issue:** If supabase client changes (which it shouldn't but it's recreated every render), new subscription created but cleanup runs with OLD channel reference
**Impact:** Multiple active subscriptions → duplicate messages, memory leak, battery drain
**Fix:** Include `supabase` in deps or ensure it's stable via useMemo

### Bug #12: Stale Supabase Client ⚠️ HIGH
**Location:** `src/hooks/useChats.ts:19`
Same as Bug #1

### Bug #13: N+1 Query Problem (Severe) 🔴 CRITICAL
**Location:** `src/hooks/useChats.ts:85-127`
```typescript
await Promise.all((matches || []).map(async (match) => {
  const { data: otherUser } = await supabase.from('users')... // Query per match
  const { data: messages } = await supabase.from('messages')... // Query per match
}));
```
**Issue:** 10 matches = 20 additional queries
**Impact:** Chat list loads VERY slowly
**Fix:** Batch queries or use single query with joins

### Bug #14: Unfiltered Realtime Subscription 🔴 CRITICAL (SECURITY)
**Location:** `src/hooks/useChats.ts:38`
```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages', // No filter!
}, (payload) => { ... })
```
**Issue:** Subscribes to ALL messages in the entire app, not just user's matches
**Impact:**
- Privacy issue (receives notification of all messages)
- Network waste (gets data for unrelated users)
- Battery drain
- Could expose message content before RLS filters it
**Fix:** Filter subscription: `filter: 'match_id=in.(match_ids_array)'`

### Bug #15: sendMessage Doesn't Update Local State ⚠️ HIGH
**Location:** `src/hooks/useChats.ts:145-170`
```typescript
const { data, error } = await supabase.from('messages').insert(...)
return { data, error: null }; // Doesn't add to local state
```
**Issue:** Relies entirely on realtime subscription to show sent message
**Impact:** If subscription is slow/fails, user won't see their own message (laggy UX)
**Fix:** Optimistically add message to local state immediately

### Bug #16: markAsRead Optimistic Update Before DB Confirm ⚠️ MEDIUM
**Location:** `src/hooks/useChats.ts:185-200`
```typescript
await supabase.from('messages').update(...)
// Updates local state without checking error
setThreads((prev) => prev.map(...))
```
**Issue:** Updates UI before confirming DB success
**Impact:** If DB update fails, UI shows "read" but DB shows "unread"
**Fix:** Update state only after verifying DB success

### Bug #17: unmatch No Rollback ⚠️ MEDIUM
**Location:** `src/hooks/useChats.ts:220`
```typescript
setThreads((prev) => prev.filter((thread) => thread.match.id !== matchId));
```
**Issue:** Removes from UI before confirming DB success
**Impact:** If DB update fails, UI shows unmatched but user is still matched
**Fix:** Remove from state only after DB confirms

---

## Pass 4: Async/Race Condition Bugs

### Bug #18: Auto-Select Race Condition ⚠️ HIGH
**Location:** `src/components/chat-view.tsx:18`
```typescript
const [selectedThreadId, setSelectedThreadId] = useState<string | null>(() => {
  return threads[0]?.match.id || null; // threads is ALWAYS empty on first render!
});
```
**Issue:** `threads` is empty on initial render, so auto-select never works
**Impact:** Feature doesn't work as intended
**Fix:** Use useEffect to set after threads loads

### Bug #19: Missing Dependencies - Stale Closure ⚠️ MEDIUM
**Location:** `src/components/chat-view.tsx:45`
```typescript
useEffect(() => {
  if (selectedThread && selectedThread.unreadCount > 0) {
    markAsRead(unreadMessageIds); // markAsRead not in deps
  }
}, [selectedThreadId, selectedThread]); // Missing markAsRead, user
```
**Issue:** If `markAsRead` function reference changes, effect won't re-run with new function
**Impact:** Might call stale version of markAsRead with outdated closure
**Fix:** Add markAsRead and user to dependency array (or disable eslint with justification)

### Bug #20: Infinite Re-Render Potential ⚠️ HIGH
**Location:** `src/components/chat-view.tsx:33`
```typescript
useEffect(() => {
  if (!selectedThreadId && threads.length > 0) {
    setSelectedThreadId(threads[0].match.id);
  }
}, [threads, selectedThreadId]); // threads object reference might change every render
```
**Issue:** If `threads` array is recreated every render (not memoized), infinite loop
**Impact:** App freezes, excessive re-renders
**Fix:** Ensure threads is stable (useMemo in useChats) or use threads.length as dependency

### Bug #21: Mode Sync Overrides User Changes ⚠️ MEDIUM
**Location:** `src/app/dashboard/page.tsx:27-31`
```typescript
useEffect(() => {
  if (profile) {
    setMode(profile.accountability_mode ? 'accountability' : 'irl');
  }
}, [profile]); // Every time profile refetches, mode resets
```
**Issue:** User toggles mode → profile refetches (for any reason) → mode resets to DB value
**Impact:** User can't manually change mode, always forced to profile default
**Fix:** Only sync mode on mount, or track "user has manually changed mode" flag

---

## Summary by Severity

### 🔴 Critical (5):
1. Bug #5: N+1 queries in matching (41 queries!)
2. Bug #11: Realtime subscription memory leak
3. Bug #13: N+1 queries in chat (21 queries per 10 matches)
4. Bug #14: Unfiltered realtime subscription (SECURITY + PERFORMANCE)

### ⚠️ High (10):
1. Bug #1, #6, #12: Stale Supabase client (3 instances)
2. Bug #3: No delete rollback
3. Bug #4: No update rollback
4. Bug #8: Promise.all fails on single error
5. Bug #10: Potential infinite loop (fetchMatches)
6. Bug #15: sendMessage no local update (laggy UX)
7. Bug #18: Auto-select doesn't work
8. Bug #20: Infinite re-render potential

### ⚙️ Medium (6):
1. Bug #2, #7, #19: Missing useEffect dependencies (3 instances)
2. Bug #9: Code duplication
3. Bug #16: markAsRead optimistic
4. Bug #17: unmatch no rollback
5. Bug #21: Mode sync override

---

## Impact Analysis

### Performance Impact:
- **N+1 Queries**: Could take 5-10 seconds to load matches/chats on slow connection
- **Memory Leak**: App will slow down over time, eventually crash
- **Unfiltered Subscription**: Wastes bandwidth, drains battery

### Data Consistency:
- **Optimistic Updates**: UI can show wrong data if operations fail
- **Stale Client**: Queries might fail intermittently after auth refresh

### Security:
- **Unfiltered Realtime**: Potential privacy leak (receiving notifications of ALL messages)

### User Experience:
- **Auto-select broken**: Feature doesn't work
- **Mode resets**: Frustrating UX, feels buggy
- **Laggy message send**: Messages don't appear immediately

---

## Recommended Fix Priority

### Immediate (Before Testing):
1. **Bug #14** - Security issue with unfiltered subscriptions
2. **Bug #5, #13** - N+1 queries (performance killer)
3. **Bug #11** - Memory leak

### High Priority (Before Production):
4. **Bug #1, #6, #12** - Stale Supabase client
5. **Bug #3, #4** - Rollback for delete/update
6. **Bug #15** - Optimistic message send
7. **Bug #18** - Fix auto-select

### Medium Priority (Quality of Life):
8. **Bug #10, #20** - Infinite loop prevention
9. **Bug #21** - Mode sync issue
10. All other bugs

---

## Testing Recommendations

After fixes, test these scenarios:

1. **Load test**: Create 50 matches, verify chat loads in < 2 seconds
2. **Auth refresh**: Wait 1 hour, verify queries still work
3. **Network failure**: Disconnect during delete/update, verify rollback
4. **Concurrent messages**: Send message from 2 devices, verify no duplicates
5. **Mode toggle**: Switch mode multiple times, verify it sticks
6. **Memory leak**: Leave app open for 1 hour, check memory usage

---

**Generated with [Claude Code](https://claude.com/claude-code)**
**Review Date**: January 21, 2025
**Reviewer**: Claude (4-pass comprehensive audit)
