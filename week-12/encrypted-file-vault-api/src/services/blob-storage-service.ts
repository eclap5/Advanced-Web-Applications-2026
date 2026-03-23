import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = Deno.env.get("AZURE_STORAGE_CONNECTION_STRING");
const containerName = Deno.env.get("AZURE_STORAGE_CONTAINER_NAME");

if (!connectionString || !containerName) {
    throw new Error("Azure Blob Storage environment variables are missing.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadBlob(
    blobName: string,
    content: Uint8Array,
): Promise<void> {
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(content, {
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream",
        },
    });
}

export async function downloadBlob(blobName: string): Promise<Uint8Array> {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.download();

    if (!response.readableStreamBody) {
        throw new Error("Blob content stream is missing.");
    }

    const chunks: Uint8Array[] = [];
    const textEncoder = new TextEncoder();

    // Normalize stream chunks to Uint8Array so binary payloads can be reassembled.
    for await (const chunk of response.readableStreamBody) {
        if (typeof chunk === "string") {
            chunks.push(textEncoder.encode(chunk));
            continue;
        }

        chunks.push(chunk);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);

    // Concatenate all chunks into one contiguous byte array for downstream decryption.
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return result;
}

export async function deleteBlob(blobName: string): Promise<void> {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
}