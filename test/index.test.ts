import { setTimeout } from "timers/promises";
import { dirname } from "dirname-filename-esm";
import { exec, ExecError } from "../index.js";
import chalk from "chalk";
import assert from "assert/strict";
// import { Mocha } from 'mocha'

describe("exec", () => {
  it("should return a promise to be resolved as output", async function () {
    const result = exec("echo hello world", {
      print: false,
    });
    assert.equal(await result, "hello world");
  });

  it("should pass line by line sequencially to onLine callback", async function () {
    // expect.assertions(2);
    const lines: string[] = [];
    const result = exec("echo 'hello\nworld'", {
      onLine: (line) => {
        lines.push(line);
      },
      print: false,
    });
    assert.equal(await result, "hello\nworld");
    assert.deepEqual(lines, ["hello", "world"]);
  });

  it("should work with cwd", async function () {
    const command = process.platform === "win32" ? "cd" : "pwd";
    const cwd = dirname(import.meta);
    const result = exec(command, {
      cwd,
      print: false,
    });
    // await expect(result).resolves.toEqual(cwd);
    assert.equal(await result, cwd);
  });

  it("should print ANSI color", async function () {
    const cwd = dirname(import.meta);
    const result = exec("node color.js", {
      cwd,
      print: false,
    });
    assert.equal(
      await result,
      `${chalk.red("red")}, ${chalk.green("green")}, ${chalk.blue("blue")}`
    );
  });

  it("should kill the pty child and let promise be rejected", async function () //this: Mocha.Context
  {
    // @ts-ignore
    this.timeout(15 * 1000);
    try {
      const result = exec("node counter.js", {
        cwd: dirname(import.meta),
        print: false,
      });
      await setTimeout(5000);
      result.kill();
      await result;
    } catch (error) {
      assert.deepEqual(error, {
        output: "0\n1\n2\n3",
        exitCode: 1,
      });
    }
  });

  it("should contain exitCode and output in error", async function () {
    try {
      await exec("node counter-error.js", {
        cwd: dirname(import.meta),
        print: false,
      });
    } catch (error) {
      const err = error as ExecError;
      assert.equal(err.exitCode, 1);
      assert(err.output.includes("i is 3!!!! Error!!!!"));
    }
  });
});
