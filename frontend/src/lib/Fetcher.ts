import { toast } from "react-toastify";

export const navigateDownloadSlice = (inpoint: number, outpoint: number) => {
  window.location.href = `http://localhost:3000/api/download/slice?inpoint=${inpoint}&outpoint=${outpoint}`;
};

export default class Fetcher {
  static async uploadUrl(url: string) {
    type APIResponse = { success: boolean; [key: string]: any; error?: string };
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
        return { success: false, error: "Invalid URL" } as APIResponse;
      }
      toast.error("Failed to upload video");
      return { success: false, error: "Failed to upload video" } as APIResponse;
    }
    return (await response.json()) as APIResponse;
  }

  static async compressVideo() {
    type APIResponse = { success: boolean; [key: string]: any; error?: string };
    const response = await fetch("/api/compress");
    if (!response.ok) {
      if (response.status === 401) {
        toast.error("No video uploaded");
        return { success: false, error: "No video uploaded" } as APIResponse;
      }
      toast.error("Failed to compress video");
      return {
        success: false,
        error: "Failed to compress video",
      } as APIResponse;
    }
    return (await response.json()) as APIResponse;
  }

  static async downloadVideo() {
    const response = await fetch("/api/download");
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

  static async getFramerateOfVideo() {
    type APIResponse = {
      success: true;
      frameRate: number;
    };
    type APIError = {
      success: false;
      error: string;
    };
    const response = await fetch("/api/framerate");
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

  static async downloadVideoSlice(inpoint: number, outpoint: number) {
    console.log(
      `getting /api/download/slice?inpoint=${inpoint}&outpoint=${outpoint}`
    );

    const response = await fetch(
      `/api/download/slice?inpoint=${inpoint}&outpoint=${outpoint}`
    );
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
