import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminNewNotificationPage from "./pages/AdminNewNotificationPage";
import AdminUsersPage from "./pages/AdminUsersPage";

export default function App() {
    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<Navigate to="/notifications" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/notifications"
                    element={(
                        <ProtectedRoute>
                            <NotificationsPage />
                        </ProtectedRoute>
                    )}
                />

                <Route
                    path="/admin/notifications/new"
                    element={(
                        <AdminRoute>
                            <AdminNewNotificationPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path="/admin/users"
                    element={(
                        <AdminRoute>
                            <AdminUsersPage />
                        </AdminRoute>
                    )}
                />

                <Route path="*" element={<Navigate to="/notifications" replace />} />
            </Routes>
        </AppLayout>
    );
}