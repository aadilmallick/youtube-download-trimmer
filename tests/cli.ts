import { spawnSync } from "child_process";

class LinuxError extends Error {
  constructor(command: string) {
    super(`Running the '${command}' command caused this error`);
  }
}

function linux(command: string, args: string[] = []) {
  try {
    const { status, stdout, stderr } = spawnSync(command, args, {
      encoding: "utf8",
    });
    return stdout;
  } catch (e) {
    console.error(e);
    throw new LinuxError(command);
  }
}
