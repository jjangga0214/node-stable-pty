import { setTimeout } from "timers/promises";
import { dirname } from "dirname-filename-esm";
import { exec, ExecError } from "../index.js";
import chalk from "chalk";

describe("exec", () => {
  test("basic usage", async () => {
    const result = exec("echo hello world", {
      print: false,
    });
    await expect(result).resolves.toEqual("hello world");
  });

  test("onLine", async () => {
    expect.assertions(2);
    const lines: string[] = [];
    const result = exec("echo 'hello\nworld'", {
      onLine: (line) => {
        lines.push(line);
      },
      print: false,
    });
    await expect(result).resolves.toEqual("hello\nworld");
    expect(lines).toEqual(["hello", "world"]);
  });

  test("cwd", async () => {
    const command = process.platform === "win32" ? "cd" : "pwd";
    const cwd = dirname(import.meta);
    const result = exec(command, {
      cwd,
      print: false,
    });
    await expect(result).resolves.toEqual(cwd);
  });

  test("color", async () => {
    const cwd = dirname(import.meta);
    const result = exec("node color.js", {
      cwd,
      print: false,
    });
    await expect(result).resolves.toEqual(
      `${chalk.red("red")}, ${chalk.green("green")}, ${chalk.blue("blue")}`
    );
  });

  test("kill", async () => {
    const result = exec("node counter.js", {
      cwd: dirname(import.meta),
      print: false,
    });
    await setTimeout(2500);
    result.kill();
    await expect(result).rejects.toEqual({
      output: "0\n1",
      exitCode: 1,
    });
  });

  test("error", async () => {
    expect.assertions(2);
    try {
      await exec("node counter-error.js", {
        cwd: dirname(import.meta),
        print: false,
      });
    } catch (error) {
      const err = error as ExecError;
      await expect(err.exitCode).toEqual(1);
      await expect(err.output).toContain("i is 3!!!! Error!!!!");
    }
  });
});
