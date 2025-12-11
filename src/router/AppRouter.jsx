import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ActivationPage from "@/pages/ActivationPage";
import ClientPage from "@/pages/ClientPage.jsx";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProtectedRoute from "@/router/ProtectedRoute";
import AdminPanel from "@/pages/AdminPanel.jsx";

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
            { path: "menu", element: <div className="p-10 text-center">Menu wkrótce...</div> },
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
            }
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