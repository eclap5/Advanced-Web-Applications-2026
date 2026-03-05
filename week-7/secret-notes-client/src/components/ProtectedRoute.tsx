/**
 * // ProtectedRoute component checks if the user is authenticated by checking if there is a valid JWT token in localStorage. 
 * If the user is not authenticated, it redirects to the login page. 
 * If the user is authenticated, it renders the children components (the protected page). 
*/
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../auth";

type Props = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Readonly<Props>) {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    return children;
}