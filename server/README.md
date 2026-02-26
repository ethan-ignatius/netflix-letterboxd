# Netflix + Letterboxd API

Backend proxy so **users never need TMDb or AWS keys**. You deploy this once with your keys; the extension sends title and face-crop requests here.

## Env (required)

- `TMDB_API_KEY` – TMDb v3 API key
- `AWS_ACCESS_KEY_ID` – IAM user with `rekognition:RecognizeCelebrities`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` – optional, default `us-east-1`
- `PORT` – optional, default `3782`

## Run

```bash
npm install
npm start
```

For production, set env on your host (Fly.io, Railway, Render, etc.) and run `node index.js` or `npm start`.

## Endpoints

- `POST /api/resolve-title` – body: `{ rawTitle, year?, isSeries? }` → TMDb title resolution
- `POST /api/person` – body: `{ personName, tmdbTitleId, mediaType }` → person + character for that title
- `POST /api/recognize-celebrities` – body: `{ imageBase64 }` → AWS Rekognition celebrity names

Rate limit: 120 requests/minute per IP.
