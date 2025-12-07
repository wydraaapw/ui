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

const ProtectedRoute = ({ children }) => {
    const { token, logout } = useAuth();

    const tokenExpired = isTokenExpired(token);

    useEffect(() => {
        if (token && tokenExpired) {
            logout();
        }
    }, [token, tokenExpired, logout]);

    if (tokenExpired) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;