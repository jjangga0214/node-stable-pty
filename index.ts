import { execPty } from "./binding.cjs";

export interface ExecOptions {
  cwd?: string;
  print?: boolean;
}

export interface ExecResult {
  output: string;
  exitCode: number;
}

export interface ExecReturn {
  kill: () => void;
  result: Promise<ExecResult>;
}

export function exec(
  command: string,
  { cwd = process.cwd(), print = true }: ExecOptions = {}
): ExecReturn {
  // @ts-ignore
  const res: ExecReturn = {};
  const result = new Promise<ExecResult>((resolve, reject) => {
    const lines: string[] = [];
    const execRes = execPty(
      command,
      cwd,
      (err, line) => {
        if (err) {
          reject(err); // This does not mean stderr. This means something wrong happens in rust's side.
        }
        if (print) {
          console.log(line);
        }
        lines.push(line);
      },
      (err, exitCode) => {
        if (err) {
          reject(err);
        }
        const result = {
          output: lines.join("\n"),
          exitCode,
        };
        if (exitCode !== 0) {
          const error = new Error();
          reject({ ...error, ...result });
        }
        resolve(result);
      }
    );
    res.kill = () => {
      // execRes.kill() is a Rust function.
      // So keep the ownership(Rust Concept) of execRes.
      execRes.kill();
    };
  });

  res.result = result;
  return res;
}
