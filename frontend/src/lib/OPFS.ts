type FileAcceptType = {
  description: string;
  accept: Record<string, string[]>; // MIME type to file extension
};

export class OPFS {
  private root!: FileSystemDirectoryHandle;
  async openDirectory() {
    try {
      this.root = await navigator.storage.getDirectory();
      return true;
    } catch (e) {
      console.error("Error opening directory:", e);
      return false;
    }
  }

  public get directory() {
    return this.root;
  }

  async getDirectoryContents() {
    this.validate();
    const data = [] as { name: string; fileHandle: FileSystemHandle }[];
    for await (const [name, handle] of this.root) {
      data.push({ name, fileHandle: handle });
    }
    return data;
  }

  private validate(): this is { root: FileSystemDirectoryHandle } {
    if (!this.root) {
      throw new Error("Root directory not set");
    }
    return true;
  }
  async createFile(filename: string) {
    this.validate();
    const file = await this.root.getFileHandle(filename, { create: true });
    return file;
  }

  async getFileHandle(filename: string) {
    this.validate();
    const file = await this.root.getFileHandle(filename);
    return file;
  }

  async deleteFile(filename: string) {
    this.validate();
    await this.root.removeEntry(filename);
  }

  async getFile(filename: string) {
    const fileHandle = await this.getFileHandle(filename);
    return await fileHandle.getFile();
  }

  async getFileAsURL(filename: string) {
    return URL.createObjectURL(await this.getFile(filename));
  }

  static async writeToFileHandle(
    file: FileSystemFileHandle,
    data: string | Blob | ArrayBuffer
  ) {
    const writable = await file.createWritable();
    await writable.write(data);
    await writable.close();
  }
}

export class FileSystemManager {
  static async openSingleFile(types: FileAcceptType[]) {
    const [fileHandle] = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: false,
    });
    return fileHandle;
  }

  static async openMultipleFiles(types: FileAcceptType[]) {
    const fileHandles = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: true,
    });
    return fileHandles;
  }

  static async openDirectory({
    mode = "read",
    startIn,
  }: {
    mode?: "read" | "readwrite";
    startIn?: StartInType;
  }) {
    const dirHandle = await window.showDirectoryPicker({
      mode: mode,
      startIn: startIn,
    });
    return dirHandle;
  }

  static createFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.getFileHandle(filename, { create: true });
  }

  static getFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.getFileHandle(filename, { create: false });
  }

  static async readDirectoryHandle(dirHandle: FileSystemDirectoryHandle) {
    const values = await Array.fromAsync(dirHandle.values());
    return values;
  }

  static async saveTextFile(text: string) {
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "Text files",
          accept: {
            "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
          },
        },
      ],
    });
    await this.writeData(fileHandle, text);
  }

  static FileTypes = {
    getTextFileTypes: () => {
      return {
        description: "Text files",
        accept: {
          "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
        },
      };
    },
    getVideoFileTypes: () => {
      return {
        description: "Video files",
        accept: {
          "video/*": [".mp4", ".avi", ".mkv", ".mov", ".webm"],
        },
      };
    },
    getImageFileTypes: () => {
      return {
        description: "Image files",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
        },
      };
    },
  };

  static async saveFile(options: {
    data: Blob | string;
    types?: FileAcceptType[];
    name?: string;
    startIn?: StartInType;
  }) {
    const fileHandle = await window.showSaveFilePicker({
      types: options.types,
      suggestedName: options.name,
      startIn: options.startIn,
    });
    await this.writeData(fileHandle, options.data);
  }

  private static async writeData(
    fileHandle: FileSystemFileHandle,
    data: Blob | string
  ) {
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
}
