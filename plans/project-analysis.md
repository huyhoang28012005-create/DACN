# DACN Project Analysis & Remediation Plan

## Project Overview

**Project Name:** Lab Management System (DACN)
**Backend:** NestJS + Prisma + MySQL + Redis
**Frontend:** React + TypeScript + Vite + i18next
**Structure:** Monorepo with `/backend` and `/frontend` directories

---

## 1. Backend ↔ Frontend Integration Status

### ✅ ALIGNED Modules (Fully Connected)

| Module | Backend Endpoints | Frontend Service | Status |
|--------|------------------|------------------|--------|
| **Auth** | register, login, logout, mfa/* | authService ✅ | ✅ Complete |
| **Users** | CRUD + import, activity, trust-score, reset-mfa | userService ✅ | ✅ Complete |
| **Rooms** | CRUD | roomService ✅ | ✅ Complete |
| **Courses** | CRUD | courseService ✅ | ✅ Complete |
| **Bookings** | CRUD + reschedule, cancel, suggest-slots | bookingService ✅ | ✅ Complete |
| **Check-in** | CRUD + scan-qr, check-out | checkInService ✅ | ✅ Complete |
| **Notifications** | get, mark-read, mark-all-read | notificationService ✅ | ✅ Complete |
| **Comments** | CRUD by entity | commentService ✅ | ✅ Complete |
| **Reports** | CRUD + stats, my-reports | reportService ✅ | ✅ Complete |
| **Uploads** | file upload | uploadService ✅ | ✅ Complete |

### ⚠️ PARTIALLY ALIGNED Modules

| Module | Backend | Frontend | Issues |
|--------|---------|----------|--------|
| **Equipment** | Full CRUD | equipmentService ✅ | ✅ Aligned |
| **Chemicals** | Full CRUD + usage + alerts | chemicalService ✅ | ✅ Aligned |
| **Combos** | Full CRUD + book | comboService ⚠️ | **DUPLICATE definition** |
| **Maintenance** | create, getAll, delete | maintenanceService ⚠️ | **DUPLICATE definition** |
| **Investments** | create, getAll, delete | investmentService ✅ | ✅ Aligned |
| **Publications** | create, getAll, delete | publicationService ✅ | ✅ Aligned |

### 🔴 GAPS (Missing Implementation)

| Gap | Frontend Usage | Backend Status | Priority |
|-----|---------------|----------------|----------|
| `bookingService.exportExcel()` | Approvals.tsx line 185 | **Not implemented** | HIGH |
| `/api/reports/schedule-maintenance/:equipmentId` | Reports.tsx line 204 | **Not implemented** | HIGH |
| Forgot Password API | ForgotPassword.tsx | **UI only, no API** | HIGH |
| `maintenanceService.update()` | Maintenance page | **Missing** | MEDIUM |
| `maintenanceService.getOne()` | - | **Missing** | MEDIUM |

---

## 2. Code Quality Issues

### 🔴 CRITICAL: Duplicate Service Definitions

**File:** `frontend/src/services/index.ts`

Two pairs of services are defined twice (later definition overwrites earlier):

1. **maintenanceService** - Lines 234-240 AND 312-316
2. **comboService** - Lines 225-232 AND 318-324

```typescript
// First definition (lines 234-240)
export const maintenanceService = {
  create: (data) => apiClient.post('/api/maintenance', data),
  getAll: () => apiClient.get('/api/maintenance'),
  getOne: (id) => apiClient.get(`/api/maintenance/${id}`),
  update: (id, data) => apiClient.patch(`/api/maintenance/${id}`, data),
  delete: (id) => apiClient.delete(`/api/maintenance/${id}`),
};

// Duplicate definition (lines 312-316) - OVERWRITES the above!
export const maintenanceService = {
  create: (data) => apiClient.post('/api/maintenance', data),
  getAll: () => apiClient.get('/api/maintenance'),
  delete: (id) => apiClient.delete(`/api/maintenance/${id}`),  // Missing getOne & update!
};
```

**Impact:** The second definition lacks `getOne()` and `update()` methods.

---

### 🟡 MEDIUM: Missing `getOne()` for Maintenance

**Backend:** `maintenance.controller.ts` has `findOne()` endpoint (GET `/maintenance/:id`)
**Frontend:** `maintenanceService` second definition missing `getOne()` method

---

### 🟡 MEDIUM: `bookingService.exportExcel()` Not Implemented

**Frontend:** `Approvals.tsx` line 185 references `bookingService.exportExcel()`
**Backend:** No `exportExcel()` method in `bookingService` or controller

---

### 🟡 MEDIUM: Schedule Maintenance Not Implemented

**Frontend:** `Reports.tsx` line 204 makes direct call to `/api/reports/schedule-maintenance/:equipmentId`
**Backend:** No such endpoint exists in `reports.controller.ts`

**Note:** There IS a `scheduleMaintenance()` method in backend service but NO controller endpoint exposing it.

---

### 🟢 LOW: Forgot Password is UI Placeholder

**Frontend:** `ForgotPassword.tsx` shows form but only uses `alert()` mock
**Backend:** No forgot-password/reset-password endpoints exist

---

## 3. Configuration Analysis

### ✅ API Configuration Aligned

| Setting | Backend (main.ts) | Frontend (apiClient.ts) | Status |
|---------|-------------------|-------------------------|--------|
| API Prefix | `/api` | Manual `/api` prefix | ✅ OK |
| Port | `3000` | `3000` | ✅ OK |
| CORS | `FRONTEND_URL:5173` | Browser default | ✅ OK |
| Auth Header | - | `Bearer ${token}` | ✅ OK |

### ⚠️ Auth Token Storage Security Concern

- Access token stored in **localStorage** (less secure)
- Refresh token uses **HttpOnly cookie** (good)
- Ideally: both should use HttpOnly cookies

---

## 4. Backend Missing/Incomplete Features

### 🟡 Maintenance Module - No Update Endpoint

**Backend:** `maintenance.controller.ts` only has:
- `create()` - POST
- `findAll()` - GET
- `remove()` - DELETE

**Missing:** `update()` - PATCH endpoint

### 🟡 Search Module - Limited Scope

**Backend:** Only searches `rooms` and `equipment`
**Should search:** bookings, reports, chemicals, courses, users

### 🟡 Reports - No PUT Endpoint

Only has PATCH for updates, no full PUT replacement

### 🟡 Investments/Publications - No GET by ID

Only `findAll()`, no `findOne(id)` for single item retrieval

---

## 5. Prisma Schema Notes

**Status:** Schema appears complete with all entities properly related

**Potential Issue:** Comment in `auth.service.ts` mentions Prisma client may need regeneration for `loginHistory` table

---

## 6. Remediation Plan

### Phase 1: Critical Fixes (Do First)

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 1 | **Remove duplicate service definitions** in `services/index.ts` and merge into single clean definition | `frontend/src/services/index.ts` | 10 min |
| 2 | **Implement `bookingService.exportExcel()`** - add to frontend service and backend endpoint | `backend/bookings`, `frontend/services` | 30 min |
| 3 | **Fix Reports schedule-maintenance** - either add controller endpoint OR remove frontend call | `backend/reports`, `frontend/pages/Reports.tsx` | 20 min |
| 4 | **Add `maintenanceService.update()`** method to frontend (or verify backend has it) | `frontend/services/index.ts` | 5 min |

### Phase 2: Important Improvements

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 5 | **Implement Forgot Password API** (backend + frontend) | `backend/auth`, `frontend/pages/ForgotPassword.tsx` | 2 hours |
| 6 | **Add maintenance PATCH endpoint** to backend controller | `backend/maintenance/maintenance.controller.ts` | 15 min |
| 7 | **Enhance Search module** to cover more entities | `backend/search/search.service.ts` | 1 hour |

### Phase 3: Nice to Have

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 8 | **Add GET by ID** for Investments and Publications | `backend/investments`, `backend/publications` | 30 min |
| 9 | **Implement Reports PUT endpoint** | `backend/reports` | 15 min |
| 10 | **Move auth token to HttpOnly cookie** (security improvement) | `backend/auth`, `frontend/authStore` | 2 hours |
| 11 | **Regenerate Prisma client** after verifying schema | `backend/prisma` | 10 min |

---

## 7. Quick Wins Checklist

- [ ] Remove duplicate `maintenanceService` definition
- [ ] Remove duplicate `comboService` definition  
- [ ] Add missing `getOne` and `update` to merged `maintenanceService`
- [ ] Choose: implement `schedule-maintenance` endpoint OR remove from Reports.tsx
- [ ] Add `exportExcel` to bookingService frontend OR create it in backend
- [ ] Implement forgot password flow OR disable the page link

---

## Summary Stats

| Category | Count |
|----------|-------|
| Total Backend Modules | 19 |
| Fully Aligned | 11 |
| Partially Aligned (needs fix) | 2 (combos, maintenance) |
| Missing Backend Implementation | 2 (exportExcel, schedule-maintenance) |
| Code Quality Issues | 4 duplicates + 1 placeholder |

**Overall Integration Health: ~85%** - Core functionality connected, needs cleanup of duplicates and completion of missing pieces.