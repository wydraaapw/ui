import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/auth/HomePage.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";
import RegisterPage from "@/pages/auth/RegisterPage.jsx";
import ActivationPage from "@/pages/auth/ActivationPage.jsx";
import ClientPage from "@/pages/client/ClientPage.jsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.jsx";
import ProtectedRoute from "@/router/ProtectedRoute";
import AdminPanel from "@/pages/admin/AdminPanel.jsx";
import AdminMenuPage from "@/pages/admin/menu/AdminMenuPage.jsx";
import AdminWaitersPage from "@/pages/admin/waiter/AdminWaitersPage.jsx";
import TableManager from "@/pages/admin/tables/TableManager.jsx";
import ReservationPage from "@/pages/client/ReservationPage.jsx";
import AdminReservationsPage from "@/pages/admin/reservations/AdminReservationPage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "activate", element: <ActivationPage /> },
            { path: "forgot-password", element: <ForgotPasswordPage /> },
            { path: "reset-password", element: <ResetPasswordPage /> },
            {
                path: "reservations",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_CLIENT']}>
                        <ReservationPage />
                    </ProtectedRoute>
                )
            },
            { path: "opinions", element: <div className="p-10 text-center">Opinie wkrótce...</div> },

            {
                path: "dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_CLIENT']}>
                        <ClientPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "reservations",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_CLIENT']}>
                        <div className="p-10 text-center">Formularz rezerwacji (Wkrótce)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "admin",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <AdminPanel />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/menu",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <AdminMenuPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/staff",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <AdminWaitersPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/tables",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <TableManager />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/reservations",
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <AdminReservationsPage />
                    </ProtectedRoute>
                )
            },

        ]
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}