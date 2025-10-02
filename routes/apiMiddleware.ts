import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createMiddleware } from "hono/factory";

const youtubeVideoRegex = /https:\/\/www\.youtube\.com\/watch\?v=.{11}/;

export const validateYoutubeUrl = zValidator(
  "json",
  z.object({
    url: z.string().trim().url().regex(youtubeVideoRegex),
  })
);

export const validateYoutubeId = zValidator(
  "json",
  z.object({
    id: z.string().trim().length(11),
  })
);

export const validateInpointOutpoint = zValidator(
  "json",
  z.object({
    inpoint: z.coerce.number().gt(-1),
    outpoint: z.coerce.number().gt(-1),
    filePath: z.string().trim(),
  })
);

export const validateVideoIsUploaded = zValidator(
  "json",
  z.object({
    filePath: z.string().trim(),
  })
);

export const validateHasFrame = zValidator(
  "json",
  z.object({
    filePath: z.string().trim(),
    currentTime: z.coerce.number().gt(-0.1),
  })
);
