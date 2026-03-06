import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../auth";

type Props = {
    children: React.ReactNode;
};

// Redirect unauthenticated users to the login page.
export default function ProtectedRoute({ children }: Readonly<Props>) {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    return children;
}