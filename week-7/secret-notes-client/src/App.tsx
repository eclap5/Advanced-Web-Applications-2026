/**
 * In this week we will introduce React Router in our application. Router allows us to create multiple pages in our application, and navigate between them. 
 * We will create three pages in our application: login, register and notes. 
 * Login and register pages will be accessible to everyone, but notes page will be protected and only accessible to authenticated users.
 * We will also create a simple NavBar component to navigate between pages.
*/

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
            <NavBar />  {/* NavBar will be rendered on every page, as it is outside of Routes component. */}

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