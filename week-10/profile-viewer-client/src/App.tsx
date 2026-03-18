import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/profile"
                    element={(
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    )}
                />
            </Routes>
        </BrowserRouter>
    );
}