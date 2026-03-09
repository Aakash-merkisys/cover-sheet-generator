import { randomUUID } from "crypto";

export interface GeneratedFile {
  id: string;
  data: Buffer;
  filename: string;
  createdAt: Date;
}

export interface IStorage {
  saveFile(data: Buffer, filename: string): Promise<string>;
  getFile(id: string): Promise<GeneratedFile | undefined>;
}

export class MemStorage implements IStorage {
  private files: Map<string, GeneratedFile>;

  constructor() {
    this.files = new Map();

    // Only set up cleanup interval in non-serverless environments
    // In serverless (Vercel), each invocation is stateless, so this won't work
    if (!process.env.VERCEL && typeof setInterval !== 'undefined') {
      // Periodically clean up old files (e.g., older than 1 hour)
      setInterval(() => {
        const now = new Date();
        for (const [id, file] of this.files.entries()) {
          if (now.getTime() - file.createdAt.getTime() > 60 * 60 * 1000) {
            this.files.delete(id);
          }
        }
      }, 15 * 60 * 1000); // Check every 15 minutes
    }
  }

  async saveFile(data: Buffer, filename: string): Promise<string> {
    const id = randomUUID();
    this.files.set(id, {
      id,
      data,
      filename,
      createdAt: new Date()
    });
    return id;
  }

  async getFile(id: string): Promise<GeneratedFile | undefined> {
    // Clean up expired files on-demand in serverless environments
    if (process.env.VERCEL) {
      const now = new Date();
      for (const [fileId, file] of this.files.entries()) {
        if (now.getTime() - file.createdAt.getTime() > 60 * 60 * 1000) {
          this.files.delete(fileId);
        }
      }
    }

    return this.files.get(id);
  }
}

export const storage = new MemStorage();
