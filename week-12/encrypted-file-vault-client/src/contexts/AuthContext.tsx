import { createContext } from "react";
import type { AuthContextValue } from "../utils/types";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);