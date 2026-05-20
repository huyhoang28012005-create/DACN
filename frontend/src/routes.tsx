import { createBrowserRouter } from "react-router";
import { Login } from "./pages/auth/Login";
import { Layout } from "./components/layout/Layout";
import { DashboardStudent } from "./pages/dashboard/DashboardStudent";
import { DashboardAdmin } from "./pages/dashboard/DashboardAdmin";
import { CalendarView } from "./pages/booking/CalendarView";
import { DeviceManagement } from "./pages/equipment/DeviceManagement";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { MyBookings } from "./pages/booking/MyBookings";
import { Approvals } from "./pages/booking/Approvals";
import { Users } from "./pages/dashboard/Users";
import { ResourceManagement } from "./pages/chemicals/ResourceManagement";
import { Reports } from "./pages/reports/Reports";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "student-dashboard", Component: DashboardStudent },
      { path: "admin-dashboard", Component: DashboardAdmin },
      { path: "calendar", Component: CalendarView },
      { path: "my-bookings", Component: MyBookings },
      { path: "approvals", Component: Approvals },
      { path: "users", Component: Users },
      { path: "devices", Component: DeviceManagement },
      { path: "resources", Component: ResourceManagement },
      { path: "reports", Component: Reports },
    ],
  },
]);
