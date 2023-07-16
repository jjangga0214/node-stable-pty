import { execPty } from "./binding.cjs";

export interface ExecOptions {
  cwd?: string;
  print?: boolean;
  onLine?: (line: string) => void;
}

export interface ExecReturn extends Promise<string> {
  kill: () => void;
}

export interface ExecError extends Error {
  output: string;
  exitCode: number;
}

export function exec(
  command: string,
  { cwd = process.cwd(), print = true, onLine = () => {} }: ExecOptions = {}
): ExecReturn {
  // @ts-ignore
  const execPtyResStore: { kill: () => void } = {};
  // @ts-ignore
  const output: ExecReturn = new Promise<string>((resolve, reject) => {
    const lines: string[] = [];
    const execPtyRes = execPty(
      command,
      cwd,
      (err, line) => {
        if (err) {
          // This does not mean stderr. This means something wrong happens in rust's side.
          // So, this err object is rejected without exitCode.
          reject(err);
        }
        if (print) {
          console.log(line);
        }
        onLine(line);
        lines.push(line);
      },
      (err, exitCode) => {
        const output = lines.join("\n");
        if (err) {
          reject({ ...err, output, exitCode });
        }
        if (exitCode !== 0) {
          const error = new Error(output);
          reject({ ...error, output, exitCode });
        }
        resolve(output);
      }
    );
    execPtyResStore.kill = () => {
      // execRes.kill() is a Rust function.
      // So keep the ownership(Rust Concept) of execRes.
      execPtyRes.kill();
    };
  });
  output.kill = execPtyResStore.kill;

  return output;
}
