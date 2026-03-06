import { Navigate } from "react-router-dom";
import { isAdmin, isLoggedIn } from "../auth";

type Props = {
    children: React.ReactNode;
};

// Redirect non-admin users to the notifications page, and unauthenticated users to the login page.
export default function AdminRoute({ children }: Readonly<Props>) {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/notifications" replace />;
    }

    return children;
}