type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: { message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export interface Note {
    id: string;
    content: string;
}