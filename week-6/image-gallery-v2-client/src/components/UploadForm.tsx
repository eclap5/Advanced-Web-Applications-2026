import { useState } from "react";

type Props = {
    uploading: boolean;
    onUpload: (file: File) => Promise<void>;
};

export default function UploadForm({ uploading, onUpload }: Readonly<Props>) {
    const [file, setFile] = useState<File | null>(null);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!file) return;
        await onUpload(file);
        setFile(null);

        // Reset the file input visually
        e.target.reset();
    }

    return (
        <form onSubmit={onSubmit} className="uploadForm">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button type="submit" className="btn" disabled={!file || uploading}>
                {uploading ? "Uploading…" : "Upload"}
            </button>
        </form>
    );
}