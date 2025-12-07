import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";

import ProtectedRoute from "@/router/ProtectedRoute.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        )
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
])

export default function AppRouter(){
    return <RouterProvider router={router} />
}