export interface JwtPayload {
    sub: string;
    email: string;
}

export type User = {
    id: string;
    email: string;
    hasEncryptionKey: boolean;
};

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterCredentials = {
    email: string;
    password: string;
    inviteCode: string;
};

export type LoginResponse = {
    token: string;
    user: User;
};

export type AuthContextValue = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    refreshCurrentUser: () => Promise<void>;
};