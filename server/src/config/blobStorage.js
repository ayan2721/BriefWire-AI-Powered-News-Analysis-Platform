import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.BLOB_CONNECTION_STRING;
const containerName = process.env.BLOB_CONTAINER || 'news';

if (!connectionString) {
    throw new Error('BLOB_CONNECTION_STRING is required');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadBlob(path, content, contentType = 'application/json') {
    const blockBlobClient = containerClient.getBlockBlobClient(path);
    const options = { blobHTTPHeaders: { blobContentType: contentType } };
    await blockBlobClient.upload(content, Buffer.byteLength(content), options);
    return blockBlobClient.url;
}

export async function downloadBlob(path) {
    const blockBlobClient = containerClient.getBlockBlobClient(path);
    const downloadResponse = await blockBlobClient.download(0);
    return await streamToString(downloadResponse.readableStreamBody);
}

async function streamToString(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
    }
    return chunks.join('');
}

export { containerClient };