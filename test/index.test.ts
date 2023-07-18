import { expect } from "chai";
import Mocha from "mocha";
import { setTimeout } from "timers/promises";
import { dirname } from "dirname-filename-esm";
import chalk from "chalk";
import { exec, ExecError } from "../index.js";

describe("exec", () => {
  it("should return a promise to be resolved as output", async function () {
    const result = exec("echo hello world", {
      print: false,
    });
    expect(await result).to.equal("hello world");
  });

  it("should pass line by line sequencially to onLine callback", async function () {
    const lines: string[] = [];
    const result = exec("echo 'hello\nworld'", {
      onLine: (line) => {
        lines.push(line);
      },
      print: false,
    });
    expect(await result).to.equal("hello\nworld");
    expect(lines).to.deep.equal(["hello", "world"]);
  });

  it("should work with cwd", async function () {
    const command = process.platform === "win32" ? "cd" : "pwd";
    const cwd = dirname(import.meta);
    const result = exec(command, {
      cwd,
      print: false,
    });
    expect(await result).to.equal(cwd);
  });

  it("should print ANSI color", async function () {
    const cwd = dirname(import.meta);
    const result = exec("node color.js", {
      cwd,
      print: false,
    });
    expect(await result).to.equal(
      `${chalk.red("red")}, ${chalk.green("green")}, ${chalk.blue("blue")}`
    );
  });

  it("should kill the pty child and let promise be rejected", async function (this: Mocha.Context) {
    this.timeout(15 * 1000);
    try {
      const result = exec("node counter.js", {
        cwd: dirname(import.meta),
        print: false,
      });
      await setTimeout(5000);
      result.kill();
      await result;
      expect.fail("promise should be rejected");
    } catch (error) {
      expect(error).to.deep.equal({
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
      expect.fail("promise should be rejected");
    } catch (error) {
      const err = error as ExecError;
      expect(err.exitCode).to.equal(1);
      expect(err.output).to.include("i is 3!!!! Error!!!!");
    }
  });
});
