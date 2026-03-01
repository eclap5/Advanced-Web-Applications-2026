import { useEffect, useState } from "react";
import type { UploadRecord } from "./types";
import { fetchUploads, uploadImage } from "./api";
import UploadForm from "./components/UploadForm";
import Gallery from "./components/Gallery";
import StatusBanner from "./components/StatusBanner";

export default function App() {
    const [uploads, setUploads] = useState<UploadRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [statusMsg, setStatusMsg] = useState("");
    const [statusVariant, setStatusVariant] = useState<"info" | "success" | "error">("info");

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        fetchUploads(controller.signal)
            .then((data) => setUploads(data))
            .catch((e) => {
                if (controller.signal.aborted) return;
                setStatusVariant("error");
                setStatusMsg(e?.message ?? "Failed to load gallery");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, []);

    async function refresh() {
        setStatusMsg("");
        const data = await fetchUploads();
        setUploads(data);
    }

    async function handleUpload(file: File) {
        try {
            setUploading(true);
            setStatusVariant("info");
            setStatusMsg("Uploading…");

            await uploadImage(file);

            setStatusVariant("success");
            setStatusMsg("Upload successful!");

            await refresh();
        } catch (e: unknown) {
            setStatusVariant("error");
            setStatusMsg(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="container">
            <header className="header">
                <div>
                    <h1>Image Gallery</h1>
                </div>

                <button className="btn" onClick={refresh} disabled={loading || uploading}>
                    Refresh
                </button>
            </header>

            <div className="card">
                <h2>Upload</h2>
                <UploadForm uploading={uploading} onUpload={handleUpload} />
                <StatusBanner message={statusMsg} variant={statusVariant} />
            </div>

            <div className="card">
                <h2>Gallery</h2>
                <Gallery uploads={uploads} loading={loading} />
            </div>
        </div>
    );
}