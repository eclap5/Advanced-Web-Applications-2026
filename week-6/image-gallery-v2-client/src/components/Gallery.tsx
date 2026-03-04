import type { UploadRecord } from "../types";

type Props = {
    uploads: UploadRecord[];
    loading: boolean;
    deletingId: string | null;
    onDelete: (uploadId: string) => Promise<void>;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
}

export default function Gallery({ uploads, loading, deletingId, onDelete }: Readonly<Props>) {
    if (loading) {
        return <div className="muted">Loading gallery…</div>;
    }

    if (uploads.length === 0) {
        return <div className="muted">No uploads yet. Upload an image above.</div>;
    }

    return (
        <div className="gallery">
            {uploads.map((u) => (
                <div key={u.id} className="imgCard">
                    <img src={`http://localhost:8000${u.url}`} alt={u.originalName} />
                    <div className="imgMeta">
                        <div className="imgName">{u.originalName}</div>
                        <div className="imgTime">{formatDate(u.uploadedAt)}</div>
                        <button
                            type="button"
                            className="btn btnDanger"
                            onClick={() => onDelete(u.id)}
                            disabled={deletingId === u.id}
                        >
                            {deletingId === u.id ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}