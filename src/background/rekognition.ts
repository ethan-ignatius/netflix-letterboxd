import { log } from "../shared/logger";
import { STORAGE_KEYS, REKOGNITION_REGION } from "../shared/constants";

export type RekognitionCeleb = {
  name: string;
  matchConfidence?: number;
};

export type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

export async function getAwsCredentials(): Promise<AwsCredentials | null> {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.AWS_ACCESS_KEY_ID,
    STORAGE_KEYS.AWS_SECRET_ACCESS_KEY,
    STORAGE_KEYS.AWS_REGION
  ]);
  const id = (data[STORAGE_KEYS.AWS_ACCESS_KEY_ID] as string | undefined)?.trim();
  const secret = (data[STORAGE_KEYS.AWS_SECRET_ACCESS_KEY] as string | undefined)?.trim();
  const region = (data[STORAGE_KEYS.AWS_REGION] as string | undefined)?.trim() || REKOGNITION_REGION;
  if (!id || !secret) return null;
  return { accessKeyId: id, secretAccessKey: secret, region };
}

/**
 * Call AWS Rekognition recognizeCelebrities with image bytes.
 * Uses AWS Signature V4 via fetch (no SDK to keep bundle small).
 */
export async function recognizeCelebrities(
  imageBytes: Uint8Array,
  credentials: AwsCredentials
): Promise<RekognitionCeleb[]> {
  const base64Bytes = await uint8ArrayToBase64(imageBytes);
  const body = JSON.stringify({
    Image: {
      Bytes: base64Bytes
    }
  });

  const url = `https://rekognition.${credentials.region}.amazonaws.com/`;
  const method = "POST";
  const service = "rekognition";
  const host = `rekognition.${credentials.region}.amazonaws.com`;
  const contentType = "application/x-amz-json-1.1";
  const amzTarget = "RekognitionService.RecognizeCelebrities";

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256Hex(body);
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${amzTarget}\n`;
  const signedHeaders = "content-type;host;x-amz-date;x-amz-target";
  const canonicalRequest = [
    method,
    "/",
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${credentials.region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest)
  ].join("\n");

  const kDate = await hmac(`AWS4${credentials.secretAccessKey}`, dateStamp);
  const kRegion = await hmac(kDate, credentials.region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = await hmacHex(kSigning, stringToSign);

  const authHeader =
    `${algorithm} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": contentType,
      Host: host,
      "X-Amz-Date": amzDate,
      "X-Amz-Target": amzTarget,
      Authorization: authHeader
    },
    body
  });

  if (!response.ok) {
    const errText = await response.text();
    log("Rekognition error", { status: response.status, body: errText });
    throw new Error(`Rekognition failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    CelebrityFaces?: Array<{
      Name?: string;
      MatchConfidence?: number;
    }>;
    UnrecognizedFaces?: unknown[];
  };

  const celebs = (data.CelebrityFaces ?? []).map((c) => ({
    name: c.Name ?? "Unknown",
    matchConfidence: c.MatchConfidence
  }));

  return celebs;
}

function uint8ArrayToBase64(bytes: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([bytes]));
  });
}

async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const keyData =
    typeof key === "string"
      ? await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(key),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        )
      : await crypto.subtle.importKey(
          "raw",
          key as ArrayBuffer,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
  const sig = await crypto.subtle.sign(
    "HMAC",
    keyData,
    new TextEncoder().encode(data)
  );
  return sig;
}

async function hmacHex(key: ArrayBuffer, data: string): Promise<string> {
  const keyData = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    keyData,
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
