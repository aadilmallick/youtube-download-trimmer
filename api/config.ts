console.log("SERVER_MODE", process.env.SERVER_MODE);

type ServerMode = "development" | "production";
type ClassKeys = keyof Config;
class Config {
  public readonly PORT: number;
  public readonly SERVER_MODE: ServerMode;
  constructor() {
    this.SERVER_MODE = (process.env.SERVER_MODE as ServerMode) || "development";
    this.PORT = Number(process.env.PORT) || 3000;
    this.validateKey("PORT");
    this.validateKey("SERVER_MODE");
  }
  private validateKey(key: ClassKeys) {
    if (!this[key]) {
      throw new Error(`${key} is not defined`);
    }
  }
}

const config = new Config();
export default config;
