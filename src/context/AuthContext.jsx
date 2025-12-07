import {createContext, useContext, useState, useEffect, useCallback, useMemo} from "react";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = useCallback((newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("token", newToken);
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    }, []);

    useEffect(() => {
        const initAuth = () => {
            const storedToken = localStorage.getItem("token");

            if (storedToken) {
                try {
                    const decoded = jwtDecode(storedToken);
                    if (decoded.exp * 1000 < Date.now()) {
                        console.warn("Token wygasł - automatyczne wylogowanie");
                        logout();
                    } else {
                        setUser({ email: decoded.sub, role: decoded.role });
                    }
                } catch (error) {
                    console.error("Błąd dekodowania tokena:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [logout]);

    const contextValue = useMemo(() => ({
        user,
        token,
        login,
        logout,
        loading
    }), [user, token, login, logout, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);