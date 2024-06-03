import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createMiddleware } from "hono/factory";
import { globalConstants } from "../api/config";

export const checkVideoIsUploadedToServer = createMiddleware(
  async (c, next) => {
    if (!globalConstants.videoFilepath) {
      c.status(401);
      return c.json({
        error: "No video uploaded",
        success: false,
        data: {
          filepath: globalConstants.videoFilepath,
        },
      });
    }
    await next();
  }
);

const youtubeVideoRegex = /https:\/\/www\.youtube\.com\/watch\?v=\w+/;

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
  "query",
  z.object({
    inpoint: z.coerce.number().gt(-1),
    outpoint: z.coerce.number().gt(-1),
  })
);
