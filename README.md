# ClipLobby Cloud V1

Browser-based editorial dashboard. Nothing needs to be installed on the end user's Mac once deployed.

## What V1 does
- Accepts a source label/authorized URL plus a transcript.
- Uses AI to identify up to 8 strong short-form moments.
- Generates hook, caption, rationale, timestamp/marker and score.
- Provides an approval queue in the browser.

## Deploy without local setup
1. Put this project in a Git repository (or import it into a supported cloud IDE).
2. Import the repo into Vercel as a Next.js project.
3. Add `OPENAI_API_KEY` in Vercel Project Settings > Environment Variables.
4. Deploy and open the generated web URL.

## Why transcript-first?
This makes V1 deployable as a normal serverless web app and avoids requiring FFmpeg/Python on the user's Mac. It also keeps source acquisition separate from the editorial system. Only use source media you are authorized to repurpose.

## V2 architecture
- Direct/resumable video upload to cloud storage.
- Server-side transcription job.
- Cloud video renderer for 9:16 crops, trim points, captions, and branding.
- Approval → publishing queue using official platform APIs where access permits.
- Analytics table for posted clips.

Cloud video rendering is intentionally not wired to arbitrary third-party video URLs in V1.
