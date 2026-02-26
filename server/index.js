/**
 * Backend proxy for Netflix + Letterboxd extension.
 * Holds TMDb and AWS keys so users don't need their own.
 * Set env: TMDB_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION (default us-east-1).
 */
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3782;

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w200";
const REKOGNITION_REGION = process.env.AWS_REGION || "us-east-1";
const REKOGNITION_HOST = `rekognition.${REKOGNITION_REGION}.amazonaws.com`;

app.use(express.json({ limit: "2mb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: "Too many requests" }
  })
);

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function getTmdbKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key?.trim()) throw new Error("TMDB_API_KEY not set");
  return key.trim();
}

function getAwsCreds() {
  const id = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!id || !secret) throw new Error("AWS credentials not set");
  return { id, secret };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDb ${res.status}`);
  return res.json();
}

async function signRekognition(body) {
  const { id: accessKeyId, secret: secretAccessKey } = getAwsCreds();
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body);
  const canonicalHeaders = `content-type:application/x-amz-json-1.1\nhost:${REKOGNITION_HOST}\nx-amz-date:${amzDate}\nx-amz-target:RekognitionService.RecognizeCelebrities\n`;
  const signedHeaders = "content-type;host;x-amz-date;x-amz-target";
  const canonicalRequest = [
    "POST",
    "/",
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${REKOGNITION_REGION}/rekognition/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest)
  ].join("\n");
  const kDate = await hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmac(kDate, REKOGNITION_REGION);
  const kService = await hmac(kRegion, "rekognition");
  const kSigning = await hmac(kService, "aws4_request");
  const signature = await hmacHex(kSigning, stringToSign);
  const auth = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return { amzDate, auth, payloadHash, body };
}

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(key, data) {
  const keyBuf =
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
          key,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
  const sig = await crypto.subtle.sign(
    "HMAC",
    keyBuf,
    new TextEncoder().encode(data)
  );
  return sig;
}

async function hmacHex(keyBuf, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// POST /api/resolve-title
app.post("/api/resolve-title", async (req, res) => {
  try {
    const apiKey = getTmdbKey();
    const { rawTitle, year, isSeries } = req.body;
    if (!rawTitle) return res.status(400).json({ error: "rawTitle required" });

    const mediaGuess = isSeries === true ? "tv" : isSeries === false ? "movie" : "multi";
    let match = null;
    let mediaType = null;

    if (mediaGuess === "tv") {
      const params = new URLSearchParams({
        api_key: apiKey,
        query: rawTitle,
        ...(year ? { first_air_date_year: String(year) } : {})
      });
      const data = await fetchJson(`${TMDB_BASE}/search/tv?${params}`);
      const results = data.results || [];
      if (results[0]?.id) {
        match = results[0];
        mediaType = "tv";
      }
    }
    if (!match && (mediaGuess === "movie" || mediaGuess === "multi")) {
      const params = new URLSearchParams({
        api_key: apiKey,
        query: rawTitle,
        ...(year ? { year: String(year) } : {})
      });
      const data = await fetchJson(`${TMDB_BASE}/search/movie?${params}`);
      const results = data.results || [];
      if (results[0]?.id) {
        match = results[0];
        mediaType = "movie";
      }
    }
    if (!match && mediaGuess === "multi") {
      const params = new URLSearchParams({ api_key: apiKey, query: rawTitle });
      const data = await fetchJson(`${TMDB_BASE}/search/multi?${params}`);
      const results = (data.results || []).filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      );
      if (results[0]?.id) {
        match = results[0];
        mediaType = match.media_type === "tv" ? "tv" : "movie";
      }
    }

    if (!match?.id) {
      return res.json({ title: rawTitle });
    }

    const details = await fetchJson(
      `${TMDB_BASE}/${mediaType}/${match.id}?api_key=${apiKey}`
    );
    const releaseDate =
      mediaType === "tv" ? details.first_air_date : details.release_date;
    const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined;

    res.json({
      title: details.title || details.name || rawTitle,
      tmdbId: details.id,
      tmdbVoteAverage: details.vote_average,
      tmdbVoteCount: details.vote_count,
      posterPath: details.poster_path,
      releaseYear: Number.isNaN(releaseYear) ? undefined : releaseYear,
      tmdbMediaType: mediaType,
      tmdbGenres: Array.isArray(details.genres)
        ? details.genres.map((g) => g.name.toLowerCase())
        : []
    });
  } catch (e) {
    console.error("resolve-title", e);
    res.status(500).json({ error: e.message || "Resolve failed" });
  }
});

// POST /api/person
app.post("/api/person", async (req, res) => {
  try {
    const apiKey = getTmdbKey();
    const { personName, tmdbTitleId, mediaType } = req.body;
    if (!personName || !tmdbTitleId || !mediaType) {
      return res.status(400).json({ error: "personName, tmdbTitleId, mediaType required" });
    }

    const searchParams = new URLSearchParams({
      api_key: apiKey,
      query: personName
    });
    const searchData = await fetchJson(
      `${TMDB_BASE}/search/person?${searchParams}`
    );
    const results = searchData.results || [];
    if (!results[0]?.id) return res.json(null);

    const person = results[0];
    const credits = await fetchJson(
      `${TMDB_BASE}/person/${person.id}/combined_credits?api_key=${apiKey}`
    );
    const cast = credits.cast || [];
    const entry = cast.find((c) => c.id === tmdbTitleId);
    const character = entry?.character ?? null;

    res.json({
      personId: person.id,
      name: person.name,
      profilePath: person.profile_path ?? null,
      character
    });
  } catch (e) {
    console.error("person", e);
    res.status(500).json({ error: e.message || "Person lookup failed" });
  }
});

// POST /api/recognize-celebrities
app.post("/api/recognize-celebrities", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

    const body = JSON.stringify({ Image: { Bytes: imageBase64 } });
    const { amzDate, auth } = await signRekognition(body);

    const resp = await fetch(`https://${REKOGNITION_HOST}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        Host: REKOGNITION_HOST,
        "X-Amz-Date": amzDate,
        "X-Amz-Target": "RekognitionService.RecognizeCelebrities",
        Authorization: auth
      },
      body
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Rekognition", resp.status, text);
      return res.status(resp.status).json({ error: "Recognition failed" });
    }

    const data = await resp.json();
    const celebrities = (data.CelebrityFaces || []).map((c) => ({
      name: c.Name || "Unknown",
      matchConfidence: c.MatchConfidence
    }));
    res.json({ celebrities });
  } catch (e) {
    console.error("recognize-celebrities", e);
    res.status(500).json({ error: e.message || "Recognition failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Netflix+Letterboxd API listening on port ${PORT}`);
});
