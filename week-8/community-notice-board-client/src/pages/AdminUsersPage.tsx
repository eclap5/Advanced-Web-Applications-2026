import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { deleteUser, fetchUsers } from "../api";
import type { PublicUser } from "../types";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadUsers() {
        setError("");

        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function onDelete(userId: string) {
        try {
            await deleteUser(userId);
            await loadUsers();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete user");
        }
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h5">Users</Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        color="error"
                                        variant="outlined"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Stack>
        </Paper>
    );
}