import chalk from "chalk";

/**
 * Print a success message with a green checkmark.
 */
export function success(message: string): void {
  console.log(chalk.green("✓"), message);
}

/**
 * Print an error message with a red cross.
 */
export function error(message: string): void {
  console.error(chalk.red("✗"), message);
}

/**
 * Print a warning message with a yellow exclamation.
 */
export function warn(message: string): void {
  console.log(chalk.yellow("!"), message);
}

/**
 * Print an info message with a blue arrow.
 */
export function info(message: string): void {
  console.log(chalk.blue("→"), message);
}

/**
 * Format a number with commas for readability.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Truncate a string to a max length, adding ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Print a styled header line.
 */
export function header(text: string): void {
  console.log();
  console.log(chalk.bold(text));
  console.log(chalk.dim("─".repeat(Math.min(text.length + 4, 60))));
}

/**
 * Print a key-value pair with alignment.
 */
export function keyValue(key: string, value: string): void {
  console.log(`  ${chalk.dim(key + ":")} ${value}`);
}

/**
 * Color-code agent type badges.
 */
export function typeBadge(type: string): string {
  switch (type) {
    case "skill":
      return chalk.bgBlue.white(` ${type} `);
    case "prompt":
      return chalk.bgMagenta.white(` ${type} `);
    case "remote":
      return chalk.bgGreen.white(` ${type} `);
    case "team":
      return chalk.bgYellow.black(` ${type} `);
    default:
      return chalk.bgGray.white(` ${type} `);
  }
}

/**
 * Color-code category labels.
 */
export function categoryLabel(category: string): string {
  return chalk.cyan(category);
}
