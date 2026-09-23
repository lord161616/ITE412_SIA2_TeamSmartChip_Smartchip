import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  AuthProvider,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";


/* ================= PUBLIC ================= */

import Shop from "./pages/Shop";


/* ================= AUTH ================= */

import Login from "./pages/Login";
import Register from "./pages/Register";


/* ================= STAFF ================= */

import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Scheduler from "./pages/Scheduler";
import Sensors from "./pages/Sensors";
import Inventory from "./pages/Inventory";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";


/* ================= DEBUG ================= */

import DebugCreateProfile from "./pages/DebugCreateProfile";


import "./App.css";


/*
 * Viewer + Operator + Administrator
 */
function StaffRoute({
  children,
}) {

  return (
    <ProtectedRoute
      allowedRoles={[
        "viewer",
        "operator",
        "administrator",
      ]}
    >
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );

}


/*
 * Operator + Administrator
 */
function OperatorRoute({
  children,
}) {

  return (
    <ProtectedRoute
      allowedRoles={[
        "operator",
        "administrator",
      ]}
    >
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );

}


/*
 * Administrator only
 */
function AdminRoute({
  children,
}) {

  return (
    <ProtectedRoute
      allowedRoles={[
        "administrator",
      ]}
    >
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );

}


/*
 * Authenticated customer/staff account.
 *
 * Useful later for /account, /orders, etc.
 */
function AccountRoute({
  children,
}) {

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );

}


export default function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>


          {/* =====================================
              PUBLIC SHOP
              
              IMPORTANT:
              Shop is public, but it now uses
              the existing MainLayout so the
              existing Sidebar is displayed.
              ===================================== */}

          <Route
            path="/"
            element={
              <MainLayout>
                <Shop />
              </MainLayout>
            }
          />


          <Route
            path="/shop"
            element={
              <MainLayout>
                <Shop />
              </MainLayout>
            }
          />


          {/* =====================================
              AUTHENTICATION
              
              Login and Register intentionally
              do NOT use MainLayout.
              ===================================== */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />


          <Route
            path="/register"
            element={
              <Register />
            }
          />


          {/* =====================================
              STAFF DASHBOARD
              ===================================== */}

          <Route
            path="/dashboard"
            element={
              <StaffRoute>
                <Dashboard />
              </StaffRoute>
            }
          />


          {/* =====================================
              STAFF MONITORING
              ===================================== */}

          <Route
            path="/notifications"
            element={
              <StaffRoute>
                <Notifications />
              </StaffRoute>
            }
          />


          <Route
            path="/sensors"
            element={
              <StaffRoute>
                <Sensors />
              </StaffRoute>
            }
          />


          <Route
            path="/history"
            element={
              <StaffRoute>
                <History />
              </StaffRoute>
            }
          />


          <Route
            path="/analytics"
            element={
              <StaffRoute>
                <Analytics />
              </StaffRoute>
            }
          />


          {/* =====================================
              OPERATOR
              ===================================== */}

          <Route
            path="/scheduler"
            element={
              <OperatorRoute>
                <Scheduler />
              </OperatorRoute>
            }
          />


          <Route
            path="/inventory"
            element={
              <OperatorRoute>
                <Inventory />
              </OperatorRoute>
            }
          />


          {/* =====================================
              ADMIN
              ===================================== */}

          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />


          {/* =====================================
              DEBUG
              ===================================== */}

          <Route
            path="/debug-create-profile"
            element={
              <AdminRoute>
                <DebugCreateProfile />
              </AdminRoute>
            }
          />


          {/* =====================================
              FALLBACK
              ===================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}