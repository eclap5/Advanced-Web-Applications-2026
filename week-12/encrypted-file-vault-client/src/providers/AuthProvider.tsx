import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    getToken,
    clearToken,
    setToken as storeToken,
} from "../utils/auth.ts";
import type {
    AuthContextValue,
    LoginCredentials,
    RegisterCredentials,
    User,
} from "../utils/types.ts";
import { AuthContext } from "../contexts/AuthContext.tsx";
import {
    getCurrentUserRequest,
    loginRequest,
    registerRequest,
} from "../utils/api.ts";

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(getToken());
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        clearToken();
        setToken(null);
        setUser(null);
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        const currentToken = getToken();

        if (!currentToken) {
            setUser(null);
            return;
        }

        try {
            const currentUser = await getCurrentUserRequest(currentToken);
            setUser(currentUser);
            setToken(currentToken);
        } catch {
            logout();
        }
    }, [logout]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const result = await loginRequest(credentials);

        storeToken(result.token);
        setToken(result.token);
        setUser(result.user);
    }, []);

    const register = useCallback(async (credentials: RegisterCredentials) => {
        await registerRequest(credentials);
    }, []);

    useEffect(() => {
        async function initializeAuth() {
            const storedToken = getToken();

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUserRequest(storedToken);
                setToken(storedToken);
                setUser(currentUser);
            } catch {
                clearToken();
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        void initializeAuth();
    }, []);

    const value = useMemo<AuthContextValue>(() => {
        return {
            user,
            token,
            isAuthenticated: Boolean(user && token),
            isLoading,
            login,
            register,
            logout,
            refreshCurrentUser,
        };
    }, [user, token, isLoading, login, register, logout, refreshCurrentUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}