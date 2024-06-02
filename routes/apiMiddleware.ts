import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const youtubeVideoRegex = /https:\/\/www\.youtube\.com\/watch\?v=\w+/;

export const validateYoutubeUrl = zValidator(
  "json",
  z.object({
    url: z.string().trim().url().regex(youtubeVideoRegex),
  })
);
