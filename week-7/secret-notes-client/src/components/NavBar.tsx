import { Link, useNavigate } from "react-router-dom";
import { clearToken, isLoggedIn } from "../auth";

export default function NavBar() {
    const navigate = useNavigate();
    const loggedIn = isLoggedIn();

    function logout() {
        clearToken();
        navigate("/login");
    }

    return (
        <nav className="nav">
            <div className="nav-left">
                <Link to="/" className="brand">Secret Notes</Link>
            </div>

            <div className="nav-right">
                <Link to="/notes">Notes</Link>
                {!loggedIn && <Link to="/register">Register</Link>}
                {!loggedIn && <Link to="/login">Login</Link>}
                {loggedIn && <button className="linkButton" onClick={logout}>Logout</button>}
            </div>
        </nav>
    );
}