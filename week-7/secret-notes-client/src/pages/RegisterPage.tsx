import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);

        try {
            await register(email.trim(), password);
            navigate("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <h2>Register</h2>
            <p className="muted">Create an account to access secret notes.</p>

            <form onSubmit={onSubmit} className="form">
                <label>
                    Email <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label>
                    Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>

                {error && <div className="error">{error}</div>}

                <button className="button" type="submit" disabled={loading}>
                    {loading ? "Registering…" : "Register"}
                </button>
            </form>

            <p className="muted">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}