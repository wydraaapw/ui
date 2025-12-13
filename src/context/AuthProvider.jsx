import {useEffect, useMemo, useState} from "react";
import axiosClient from "@/api/axiosClient.js";
import {jwtDecode} from "jwt-decode";
import {AuthContext} from "./AuthContext.jsx"
import PropTypes from "prop-types";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await axiosClient.get("/api/users/me");
            setUser(response.data);
        } catch{
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                    setLoading(false);
                } else {
                    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    void fetchUser();
                }
            } catch {
                logout();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const value = useMemo(() => ({
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
    }), [user, token]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
