import React, { createContext, useContext, useState } from "react";

interface User {
    fullName : string;
    role : string;
}

interface AuthContextType {
    user : User | null;
    token : string | null;
    loginUser : (token : string, user : User) => void;
    logout : () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const loginUser = (token: string, user: User) => {
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value = {{ user, token, loginUser, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};