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