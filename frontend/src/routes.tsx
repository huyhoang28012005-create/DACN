import { createBrowserRouter } from 'react-router';
import { Login } from './pages/auth/Login';
import { Layout } from './components/layout/Layout';
import { DashboardStudent } from './pages/dashboard/DashboardStudent';
import { DashboardAdmin } from './pages/dashboard/DashboardAdmin';
import { DashboardInstructor } from './pages/dashboard/DashboardInstructor';
import { CalendarView } from './pages/booking/CalendarView';
import BorrowToolsView from './pages/booking/BorrowToolsView';
import { DeviceManagement } from './pages/equipment/DeviceManagement';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { MyBookings } from './pages/booking/MyBookings';
import { Approvals } from './pages/booking/Approvals';
import { Users } from './pages/dashboard/Users';
import { ResourceManagement } from './pages/chemicals/ResourceManagement';
import { LimitManagement } from './pages/chemicals/LimitManagement';
import { CombosManagement } from './pages/equipment/CombosManagement';
import { MaintenanceManagement } from './pages/equipment/MaintenanceManagement';
import { Reports } from './pages/reports/Reports';
import { StrategicManagement } from './pages/reports/StrategicManagement';
import { Courses } from './pages/courses/Courses';
import { Settings } from './pages/settings/Settings';
import { Profile } from './pages/profile/Profile';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { QRScannerView } from './pages/checkin/QRScannerView';
import { Community } from './pages/community/Community';

import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/login',
    Component: Login,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/forgot-password',
    Component: ForgotPassword,
    errorElement: <ErrorBoundary />,
  },
  {
    // General protected routes
    path: '/',
    Component: ProtectedRoute,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { path: 'student-dashboard', Component: DashboardStudent },
          { path: 'admin-dashboard', Component: DashboardAdmin },
          { path: 'instructor-dashboard', Component: DashboardInstructor },
          { path: 'calendar', Component: CalendarView },
          { path: 'borrow-tools', Component: BorrowToolsView },
          { path: 'my-bookings', Component: MyBookings },
          { path: 'approvals', Component: Approvals },
          { path: 'users', Component: Users },
          { path: 'devices', Component: DeviceManagement },
          { path: 'resources', Component: ResourceManagement },
          { path: 'chemical-limits', Component: LimitManagement },
          { path: 'combos', Component: CombosManagement },
          { path: 'maintenance', Component: MaintenanceManagement },
          { path: 'courses', Component: Courses },
          { path: 'reports', Component: Reports },
          { path: 'strategic', Component: StrategicManagement },
          { path: 'settings', Component: Settings },
          { path: 'profile', Component: Profile },
          { path: 'scan-qr', Component: QRScannerView },
          { path: 'community', Component: Community },
        ],
      },
    ],
  },
]);
