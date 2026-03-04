export interface UploadRecord {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    url: string;
}

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: { message: string } | string };

export type ApiResponse<T> = ApiOk<T> | ApiErr;