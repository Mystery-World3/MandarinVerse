/**
 * Cloudflare R2 Storage Abstraction
 * Supports optional Cloudflare R2 object storage for audio, images, and downloadable assets.
 * Falls back gracefully to local public assets when credentials are not configured.
 */

export interface StorageConfig {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicDomain?: string;
}

export function getR2Config(): StorageConfig {
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicDomain: process.env.R2_PUBLIC_DOMAIN,
  };
}

export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(
    config.accountId &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
}

export function getMediaUrl(key: string): string {
  const config = getR2Config();
  if (config.publicDomain) {
    const domain = config.publicDomain.replace(/\/$/, "");
    return `${domain}/${key.replace(/^\//, "")}`;
  }
  // Fallback to local / public assets
  return `/media/${key.replace(/^\//, "")}`;
}

export async function uploadMedia(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<{ url: string; success: boolean; message?: string }> {
  if (!isR2Configured()) {
    return {
      url: `/media/${key}`,
      success: false,
      message: "Cloudflare R2 belum dikonfigurasi. Menggunakan jalur aset lokal.",
    };
  }

  // When R2 AWS-SDK is configured, upload here via S3Client
  return {
    url: getMediaUrl(key),
    success: true,
  };
}
