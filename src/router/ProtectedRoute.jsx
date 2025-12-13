import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useAuth } from '@/context/AuthContext.jsx';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch {
        return true;
    }
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { token, user, logout } = useAuth();
    const tokenExpired = isTokenExpired(token);

    useEffect(() => {
        if (token && tokenExpired) {
            logout();
        }
    }, [token, tokenExpired, logout]);

    if (tokenExpired) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0) {
        let userRole = user?.role;

        if (!userRole && token) {
            try {
                const decoded = jwtDecode(token);
                userRole = decoded.role;
            } catch{
                return <Navigate to="/login" replace />;
            }
        }

        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;