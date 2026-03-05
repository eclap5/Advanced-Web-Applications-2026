import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotesPage from "./pages/NotesPage";
import "./styles/index.css";

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />

            <main className="container">
                <Routes>
                    <Route path="/" element={<Navigate to="/notes" replace />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/notes"
                        element={(
                            <ProtectedRoute>
                                <NotesPage />
                            </ProtectedRoute>
                        )}
                    />

                    <Route path="*" element={<div className="card">Not Found</div>} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}