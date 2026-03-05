import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import { setToken } from "../auth";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = await login(email, password);
            setToken(token);
            navigate("/notes");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <h2>Login</h2>
            <p className="muted">Login to view secret notes.</p>

            <form onSubmit={onSubmit} className="form">
                <label>
                    Email <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label>
                    Password <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>

                {error && <div className="error">{error}</div>}

                <button className="button" type="submit" disabled={loading}>
                    {loading ? "Logging in…" : "Login"}
                </button>
            </form>

            <p className="muted">
                No account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}