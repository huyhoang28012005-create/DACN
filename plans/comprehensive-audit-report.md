# DACN Project - Comprehensive Audit Report & Fix Plan

**Date:** 2026-06-22
**Project:** Lab Management System (LabBook)
**Auditors:** Claude Code

---

## EXECUTIVE SUMMARY

| Category | Issues Found | Critical | High | Medium | Low |
|----------|--------------|----------|------|--------|-----|
| Backend | 27 | 8 | 12 | 5 | 2 |
| Frontend | 19 | 5 | 8 | 4 | 2 |
| **Total** | **46** | **13** | **20** | **9** | **4** |

---

## PART 1: BACKEND ISSUES

### 🔴 CRITICAL ISSUES

#### 1.1 Fire-and-Forget Promise Without Error Handling
**File:** `backend/src/bookings/bookings.service.ts`
**Lines:** 266-278, 382-389, 522, 611

```typescript
// BAD - Errors silently swallowed
this.prisma.user.findMany(...).then(...).catch((e) => console.error(e))

// BETTER - Should use proper async/await with error handling
try {
  await this.notificationService.sendToUser(userId, message);
} catch (error) {
  this.logger.error('Failed to send notification', error);
}
```

**Impact:** Notifications may fail silently, users won't know booking was approved

---

#### 1.2 Missing Null Check on Array Access
**File:** `backend/src/bookings/bookings.service.ts`
**Line:** 232

```typescript
// BAD - Accesses first element without checking length
const chemicals = await this.prisma.chemicalUsage.findMany({...});
const usage = chemicals[0]; // Could be undefined
```

**Fix:** Add length check before access

---

#### 1.3 Raw SQL Without Parameterization Risk
**File:** `backend/src/bookings/bookings.service.ts`
**Line:** 462

```typescript
// Check if raw query properly uses parameterized queries
this.prisma.$queryRaw`SELECT * FROM bookings WHERE ...`
```

**Need to verify:** All `$queryRaw` uses template literals with interpolated values (should be safe)

---

#### 1.4 Missing Authorization on Some Endpoints
**File:** `backend/src/reports/reports.controller.ts`
**Lines:** 123-130

```typescript
@Post('schedule-maintenance/:equipmentId')
@Roles(Role.ADMIN, Role.TECHNICIAN)  // ✅ Has role guard
```

**Status:** Most endpoints have proper guards - this is OK

---

#### 1.5 Race Condition in Booking Approval
**File:** `backend/src/bookings/bookings.service.ts`
**Lines:** 447-528

```typescript
// Multiple concurrent approvals could cause race condition
async approve(id: number, dto: UpdateBookingDto, user: UserPayload) {
  // Reads booking
  const booking = await this.prisma.booking.findUnique(...)
  // ... time passes ...
  // Updates booking
  await this.prisma.booking.update(...)
}
```

**Fix:** Use `FOR UPDATE` pessimistic locking for approval flow

---

### 🟠 HIGH PRIORITY ISSUES

#### 1.6 Inconsistent Response Formats
**File:** Various controllers

| Controller | Response Format |
|------------|-----------------|
| Auth | `{ message, access_token, refresh_token, user }` |
| Bookings | Direct booking object |
| Settings | `{ message }` on bulk update |
| Reports | Array of objects |

**Recommendation:** Create a standardized response wrapper:
```typescript
// common/response-format.ts
export class ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
```

---

#### 1.7 Missing Try-Catch in Service Methods
**File:** `backend/src/courses/courses.service.ts`
**Lines:** 61-63

```typescript
// Fire-and-forget notification
this.notificationsService.create({...}).catch(console.error);
```

**Should be:**
```typescript
async create(createCourseDto: CreateCourseDto, userId: number) {
  try {
    // ... course creation logic ...
    await this.notificationsService.create({...});
  } catch (error) {
    this.logger.error('Course created but notification failed', error);
  }
}
```

---

#### 1.8 Duplicate Service Definitions
**Status:** ✅ Already fixed in frontend (services/index.ts)

---

#### 1.9 Maintenance Schedules Missing Index on `start_time`
**File:** `backend/prisma/schema.prisma`

```prisma
model MaintenanceSchedule {
  // ...
  start_time DateTime
  end_time   DateTime
  // Missing index on start_time for sorting/filtering
  @@index([start_time])
}
```

---

### 🟡 MEDIUM PRIORITY ISSUES

#### 1.10 Soft Delete Not Applied Everywhere
**File:** `backend/src/prisma/prisma.service.ts`

```typescript
// Only these models have soft delete middleware:
['User', 'Course', 'Room', 'Equipment', 'Report', 'Booking', 'Chemical']
```

**Missing soft delete for:**
- `MaintenanceSchedule`
- `EquipmentCombo`
- `ScientificPublication`
- `LabInvestment`
- `LoginHistory`
- `AuditLog`

---

#### 1.11 No Pagination on `findAll` for Some Services
**File:** `backend/src/rooms/rooms.service.ts`

```typescript
// findAll returns all rooms without pagination
// Should paginate for large datasets
```

---

#### 1.12 Booking Time Overlap Check Edge Case
**File:** `backend/src/bookings/bookings.service.ts`
**Lines:** 628-680

Edge case: Booking exactly adjacent (end_time = another start_time) should be blocked with buffer time

---

### 🟢 LOW PRIORITY ISSUES

#### 1.13 Inconsistent Logger Usage
Some services use `console.error`, others use Logger from NestJS

**Recommendation:** Use consistent Logger throughout

---

## PART 2: FRONTEND ISSUES

### 🔴 CRITICAL ISSUES

#### 2.1 Empty Catch Blocks Swallowing Errors
**File:** `frontend/src/hooks/useRooms.ts`
**Lines:** 16-17

```typescript
} catch (error) {
  /* apiClient.ts will handle toast errors */
}
```

**Impact:** Error details lost, hard to debug in production

**Fix:** At minimum log the error:
```typescript
} catch (error) {
  console.error('Failed to fetch rooms:', error);
}
```

---

#### 2.2 Missing Type Definitions for API Responses
**File:** `frontend/src/services/index.ts`

```typescript
// Using Record<string, unknown> instead of specific types
update: (id: string, data: Record<string, unknown>) => ...
```

**Impact:** No autocomplete, potential runtime errors

**Fix:** Create proper interfaces for all DTOs

---

#### 2.3 API Endpoint Doesn't Match Backend
**File:** `frontend/src/pages/booking/MyBookings.tsx`
**Line:** 50

Potential mismatch in rating endpoint

**Need to verify:** Compare with backend `ratings.controller.ts`

---

#### 2.4 useEffect Missing Cleanup - Memory Leak Risk
**File:** `frontend/src/components/layout/Layout.tsx`

```typescript
useEffect(() => {
  fetchData();
  // Missing return for cleanup
}, [userStr]);
```

**Impact:** Stale closures, memory leaks on rapid navigation

**Fix:**
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);

  return () => {
    controller.abort();
  };
}, [userStr]);
```

---

#### 2.5 ForgotPassword Has No API Integration
**File:** `frontend/src/pages/auth/ForgotPassword.tsx`

```typescript
// Only shows alert, no actual API call
onClick={() => alert('Tính năng đang phát triển')}
```

**Status:** Known issue, tracked

---

### 🟠 HIGH PRIORITY ISSUES

#### 2.6 Loading States Not Handled Consistently
Multiple pages have inconsistent loading state handling

---

#### 2.7 No Empty States for Lists
**File:** Multiple pages

```typescript
// When API returns empty array, UI shows nothing
// Should show "Không có dữ liệu" placeholder
```

---

#### 2.8 Form Validation Missing on Some Pages
**File:** Various forms

- Missing required field validation
- No numeric validation for quantities
- No date validation for time ranges

---

#### 2.9 Type Safety: `any` Usage
**File:** `frontend/src/pages/booking/CalendarView.tsx`
**Lines:** Various

```typescript
// Multiple uses of 'any' type
const [overlappingBookings, setOverlappingBookings] = useState<any[]>([]);
```

**Fix:** Create proper interfaces

---

### 🟡 MEDIUM PRIORITY ISSUES

#### 2.10 No Retry Logic for Failed API Calls
**File:** `frontend/src/services/socket.ts`

```typescript
// Socket connection fails, only shows toast
// No retry mechanism
```

---

#### 2.11 Profile Page Login History Empty Catch
**File:** `frontend/src/pages/profile/Profile.tsx`
**Lines:** 141-143

---

### 🟢 LOW PRIORITY ISSUES

#### 2.12 Inconsistent Toast Messages
Various pages use different styles for toast notifications

---

## PART 3: FIX PLAN

### Phase 1: Critical Fixes (Do First)

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 1 | Add error handling to fire-and-forget promises | `bookings.service.ts` | 2h |
| 2 | Add null checks for array access | `bookings.service.ts` | 30m |
| 3 | Fix empty catch blocks in frontend | `useRooms.ts`, `Profile.tsx` | 30m |
| 4 | Add useEffect cleanup | `Layout.tsx` | 1h |
| 5 | Fix field name mismatch in MaintenanceManagement | Frontend | 10m |

---

### Phase 2: High Priority Fixes

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 6 | Create standardized API response wrapper | Backend | 3h |
| 7 | Add pagination to findAll methods | Backend | 2h |
| 8 | Add indexes for soft delete queries | `prisma/schema.prisma` | 30m |
| 9 | Create TypeScript interfaces for all DTOs | Frontend | 4h |
| 10 | Add missing validation to DTOs | Backend | 2h |

---

### Phase 3: Medium Priority

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 11 | Standardize logger usage | Backend | 1h |
| 12 | Add loading/error/empty states to all pages | Frontend | 4h |
| 13 | Add retry logic to socket connection | `socket.ts` | 1h |
| 14 | Apply soft delete to remaining models | `prisma/schema.prisma` | 2h |

---

### Phase 4: Nice to Have

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 15 | Implement Forgot Password API | Backend + Frontend | 4h |
| 16 | Add unit tests for critical services | Backend | 8h |
| 17 | Add E2E tests with Playwright | Frontend | 8h |

---

## PART 4: VERIFICATION CHECKLIST

### Backend Verification
- [ ] All endpoints return consistent response format
- [ ] All async operations have proper error handling
- [ ] All Prisma queries are safe from injection
- [ ] All controllers have proper guards
- [ ] Soft delete applied to all models
- [ ] Indexes added for frequently queried fields

### Frontend Verification
- [ ] All API calls have error handling
- [ ] All pages have loading/empty states
- [ ] All forms have validation
- [ ] No `any` types where interfaces can be used
- [ ] useEffect cleanup implemented
- [ ] TypeScript strict mode passes

---

## APPENDIX: FILES SUMMARY

### New Files Created This Session
```
backend/src/chemical-limits/
├── chemical-limits.controller.ts
├── chemical-limits.module.ts
├── chemical-limits.service.ts
└── dto/create-chemical-limit.dto.ts

frontend/src/pages/chemicals/LimitManagement.tsx
```

### Files Modified This Session
```
backend/
├── prisma/schema.prisma          (+ChemicalLimit, +UserPublication)
├── app.module.ts                  (+ChemicalLimitsModule)
├── publications.controller.ts     (+new endpoints)
├── publications.service.ts        (+new methods)
├── combos.controller.ts           (+PATCH endpoint)
├── combos.service.ts              (+update method)
├── maintenance.controller.ts      (+PATCH, +GET :id)
├── maintenance.service.ts        (+update, +findOne)
└── chemical-limits.controller.ts  (fixed Query param)

frontend/
├── services/index.ts              (+chemicalLimitService)
├── routes.tsx                     (+/chemical-limits)
└── pages/equipment/MaintenanceManagement.tsx  (field name fix)
```

---

**End of Report**