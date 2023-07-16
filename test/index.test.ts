import { dirname, filename } from "dirname-filename-esm";
import { exec } from "../index.js";

test("basic usage", async () => {
  const { result } = exec("echo hello world");
  await expect(result).resolves.toEqual({
    output: "hello world",
    exitCode: 0,
  });
});

// test("onData", async () => {
//   const { result } = exec("echo hello/n world", {
//     onData: (data) => {},
//   });
//   await expect(result).resolves.toEqual({
//     output: "hello world",
//     exitCode: 0,
//   });
// });

// test("cwd", async () => {
//   const command = process.platform === "win32" ? "cd" : "pwd";
//   const cwd = dirname(import.meta);
//   const { result } = exec(command, {
//     cwd,
//   });
//   const result =
//   await expect(result).resolves.toEqual({
//     output: "hello world",
//     exitCode: 0,
//   });
// });

// test("kill", async () => {
//   const { kill } = exec("echo hello world");
//   await expect(result).resolves.toEqual({
//     output: "hello world",
//     exitCode: 0,
//   });
// });
