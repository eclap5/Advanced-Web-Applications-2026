import { useState } from "react";
import {
    deleteUser,
    getAdminAudit,
    getDebugConfig,
    getNote,
    login,
    register,
    searchUsersByEmail,
} from "./api";

export default function App() {
    const [email, setEmail] = useState("alice@example.com");
    const [password, setPassword] = useState("alice123");
    const [token, setToken] = useState("");

    const [searchEmail, setSearchEmail] = useState("");
    const [role, setRole] = useState("user");
    const [noteId, setNoteId] = useState("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    const [deleteUserId, setDeleteUserId] = useState(
        "33333333-3333-3333-3333-333333333333",
    );

    const [output, setOutput] = useState("");

    function show(data: unknown) {
        setOutput(JSON.stringify(data, null, 4));
    }

    return (
        <div style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
            <h1>Week 11 Security Demo</h1>

            <section style={{ marginBottom: 24 }}>
                <h2>Register / Login</h2>

                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                    />
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                    />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={async () => {
                            const data = await register(email, password);
                            show(data);
                        }}
                    >
                        Register
                    </button>

                    <button
                        onClick={async () => {
                            const data = await login(email, password);
                            show(data);

                            if (data?.data?.token) {
                                setToken(data.data.token);
                            }
                        }}
                    >
                        Login
                    </button>
                </div>

                <p><strong>Token:</strong> {token || "(none)"}</p>
            </section>

            <section style={{ marginBottom: 24 }}>
                <h2>A05 Injection</h2>

                <input
                    style={{ width: 400 }}
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Try: ' OR '1'='1"
                />
                <button
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                        const data = await searchUsersByEmail(searchEmail);
                        show(data);
                    }}
                >
                    Search Users
                </button>
            </section>

            <section style={{ marginBottom: 24 }}>
                <h2>A01 Broken Access Control</h2>

                <div style={{ marginBottom: 8 }}>
                    <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="role"
                    />
                    <button
                        style={{ marginLeft: 8 }}
                        onClick={async () => {
                            const data = await getAdminAudit(role);
                            show(data);
                        }}
                    >
                        Get Admin Audit
                    </button>
                </div>

                <div style={{ marginBottom: 8 }}>
                    <input
                        style={{ width: 420 }}
                        value={noteId}
                        onChange={(e) => setNoteId(e.target.value)}
                        placeholder="note id"
                    />
                    <button
                        style={{ marginLeft: 8 }}
                        onClick={async () => {
                            const data = await getNote(noteId, token);
                            show(data);
                        }}
                    >
                        Read Note
                    </button>
                </div>

                <div>
                    <input
                        style={{ width: 420 }}
                        value={deleteUserId}
                        onChange={(e) => setDeleteUserId(e.target.value)}
                        placeholder="user id"
                    />
                    <button
                        style={{ marginLeft: 8 }}
                        onClick={async () => {
                            const data = await deleteUser(deleteUserId);
                            show(data);
                        }}
                    >
                        Delete User
                    </button>
                </div>
            </section>

            <section style={{ marginBottom: 24 }}>
                <h2>A02 Security Misconfiguration</h2>

                <button
                    onClick={async () => {
                        const data = await getDebugConfig();
                        show(data);
                    }}
                >
                    Get Debug Config
                </button>
            </section>

            <section>
                <h2>Output</h2>
                <pre
                    style={{
                        background: "#111",
                        color: "#0f0",
                        padding: 16,
                        borderRadius: 8,
                        minHeight: 300,
                        overflow: "auto",
                    }}
                >
                    {output}
                </pre>
            </section>
        </div>
    );
}