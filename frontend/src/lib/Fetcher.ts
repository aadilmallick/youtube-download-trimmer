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
        return { success: false, error: "Invalid URL" } as APIResponse;
      }
      return { success: false, error: "Failed to upload video" } as APIResponse;
    }
    return (await response.json()) as APIResponse;
  }
}
