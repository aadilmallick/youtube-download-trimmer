export class Print {
  private static colors = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
  };
  private static RESET = "\x1b[0m";
  static red = (...args: any[]) =>
    console.log(Print.colors.RED, ...args, Print.RESET);
  static green = (...args: any[]) =>
    console.log(Print.colors.GREEN, ...args, Print.RESET);
  static yellow = (...args: any[]) =>
    console.log(Print.colors.YELLOW, ...args, Print.RESET);
  static blue = (...args: any[]) =>
    console.log(Print.colors.BLUE, ...args, Print.RESET);
  static magenta = (...args: any[]) =>
    console.log(Print.colors.MAGENTA, ...args, Print.RESET);
  static cyan = (...args: any[]) =>
    console.log(Print.colors.CYAN, ...args, Print.RESET);
}

interface PrintAdvancedColors {
  colors: {
    RED: string;
    GREEN: string;
    YELLOW: string;
    BLUE: string;
    MAGENTA: string;
    CYAN: string;
  };
  print: {
    [k in Lowercase<keyof PrintAdvancedColors["colors"]>]: (
      ...args: any[]
    ) => void;
  };
}

export class PrintAdvanced implements PrintAdvancedColors {
  public readonly colors = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
  };
  private BOLD = "";
  private ITALIC = "";
  private RESET = "\x1b[0m";
  public readonly print = {} as PrintAdvancedColors["print"];
  constructor({
    shouldBold = false,
    shouldItalic = false,
  }: {
    shouldBold?: boolean;
    shouldItalic?: boolean;
  } = {}) {
    if (shouldBold) {
      this.BOLD = "\x1b[1m";
    }
    if (shouldItalic) {
      this.ITALIC = "\x1b[3m";
    }

    for (let color in this.colors) {
      this.print[color.toLowerCase() as keyof PrintAdvancedColors["print"]] = (
        ...args: any[]
      ) => {
        console.log(
          `${this.BOLD}${this.ITALIC}${
            this.colors[color as keyof PrintAdvanced["colors"]]
          }${args.join(" ")}${this.RESET}`
        );
      };
    }
  }
}

// const pr = new PrintAdvanced({
//   shouldBold: true,
//   shouldItalic: true,
// });
// pr.print.red("Hello", "World");
