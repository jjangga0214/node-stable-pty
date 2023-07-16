import { dirname } from "dirname-filename-esm";
import { setTimeout } from "timers/promises";
import { exec } from "../index.js";

describe("exec", () => {
  test("basic usage", async () => {
    const result = exec("echo hello world", {
      print: false,
    });
    await expect(result).resolves.toEqual({
      output: "hello world",
      exitCode: 0,
    });
  });

  test("onData", async () => {
    const lines: string[] = [];
    const result = exec("echo 'hello\nworld'", {
      onData: (line) => {
        lines.push(line);
      },
    });
    await expect(result).resolves.toEqual({
      output: "hello\nworld",
      exitCode: 0,
    });
    expect(lines).toEqual(["hello", "world"]);
  });

  test("cwd", async () => {
    const command = process.platform === "win32" ? "cd" : "pwd";
    const cwd = dirname(import.meta);
    const result = exec(command, {
      cwd,
    });
    await expect(result).resolves.toEqual({
      output: cwd,
      exitCode: 0,
    });
  });

  test("kill", async () => {
    const result = exec("node counter.js", {
      cwd: dirname(import.meta),
    });
    await setTimeout(2500);
    result.kill();
    await expect(result).rejects.toEqual({
      output: "0 1 ",
      exitCode: 1,
    });
  });
});
