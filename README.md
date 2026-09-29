# ClipLobby Cloud V2

Browser-only workflow: upload an authorized video -> Cloudinary stores/transcodes it -> OpenAI transcribes -> AI finds funny moments -> Cloudinary generates vertical clip previews -> approve/reject in the dashboard.

## Vercel environment variables
- OPENAI_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## V2 limits
Start with source videos under 25 minutes. Multi-hour VOD chunking, animated burned-in captions, persistent queues/database, and official social publishing are later milestones.

Use only media you have permission to upload and repurpose.
