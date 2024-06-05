import { toast } from "react-toastify";

export const navigateDownloadSlice = (inpoint: number, outpoint: number) => {
  window.location.href = `http://localhost:3000/api/download/slice?inpoint=${inpoint}&outpoint=${outpoint}`;
};

export default class Fetcher {
  static async uploadUrl(url: string) {
    type ErrorResponse = { success: false; error: string };
    type APIResponse = {
      success: true;
      youtubeId: string;
      filePath: string;
    };
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      if (response.status === 400) {
        toast.error("Invalid URL");
        return { success: false, error: "Invalid URL" } as ErrorResponse;
      }
      toast.error("Failed to upload video");
      return {
        success: false,
        error: "Failed to upload video",
      } as ErrorResponse;
    }
    return (await response.json()) as APIResponse;
  }

  static async compressVideo(filePath: string) {
    type ErrorResponse = { success: false; error: string };
    type APIResponse = {
      success: true;
      filePath: string;
    };
    const response = await fetch("/api/compress", {
      method: "POST",
      body: JSON.stringify({
        filePath,
      }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        toast.error("No video uploaded");
        return { success: false, error: "No video uploaded" } as ErrorResponse;
      }
      toast.error("Failed to compress video");
      return {
        success: false,
        error: "Failed to compress video",
      } as ErrorResponse;
    }
    return (await response.json()) as APIResponse;
  }

  static async downloadVideo(filePath: string) {
    const response = await fetch("/api/download", {
      method: "POST",
      body: JSON.stringify({
        filePath,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        toast.error("No video uploaded");
        return null;
      }
      toast.error("Server error");
      return null;
    }
    return response.blob();
  }

  static async getFramerateOfVideo(filePath: string) {
    type APIResponse = {
      success: true;
      frameRate: number;
    };
    type APIError = {
      success: false;
      error: string;
    };
    const response = await fetch("/api/framerate", {
      method: "POST",
      body: JSON.stringify({
        filePath,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        toast.error("No video uploaded");
        return { success: false, error: "No video uploaded" } as APIError;
      }
      toast.error("Failed to get framerate");
      return {
        success: false,
        error: "Failed to get framerate",
      } as APIError;
    }
    return (await response.json()) as APIResponse;
  }

  static async downloadVideoSlice(
    inpoint: number,
    outpoint: number,
    filePath: string
  ) {
    const response = await fetch("/api/download/slice", {
      method: "POST",
      body: JSON.stringify({
        filePath,
        inpoint,
        outpoint,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        toast.error("No video uploaded");
        return null;
      }
      toast.error("Server error");
      return null;
    }
    return response.blob();
  }
}
