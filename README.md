# youtube-download-trimmer

A self-hosted web application to download and trim youtube videos, running in Docker. Try it out at https://youtube-download-trimmer.onrender.com/ or learn to download it yourself.

1. Clone this repo

   ```bash
   https://github.com/aadilmallick/youtube-download-trimmer.git
   ```

2. Create a `.env` file to hold environment variables Docker compose will use at runtime. Add environment variables to the `.env` file

   ```bash
   SERVER_MODE=development
   PORT=3000
   VITE_API_URL_DEV=http://localhost:${PORT}
   ```

3. Run `docker compose up` to build the container and get the service running live on your laptop, at `http://localhost:3000`.

## Steps for future

- [x] create /api/upload route
- [x] Create application context. Navigate to new page showing compress video and download video option
- [ ] Prevent user from leaving page if they have unsaved changes
- [x] Add frame seeking keyboard shortcuts
- [ ] Add visual indicator of inpoint outpoint on timeline

## What I learned
