import { execPty } from "./binding.cjs";

export interface ExecOptions {
  cwd?: string;
  print?: boolean;
  onData?: (line: string) => void;
}

export interface ExecResult {
  output: string;
  exitCode: number;
}

export interface ExecReturn extends Promise<ExecResult> {
  kill: () => void;
}

export function exec(
  command: string,
  { cwd = process.cwd(), print = true, onData = () => {} }: ExecOptions = {}
): ExecReturn {
  // @ts-ignore
  const execPtyResStore: { kill: () => void } = {};
  // @ts-ignore
  const result: ExecReturn = new Promise<ExecResult>((resolve, reject) => {
    const lines: string[] = [];
    const execPtyRes = execPty(
      command,
      cwd,
      (err, line) => {
        if (err) {
          reject(err); // This does not mean stderr. This means something wrong happens in rust's side.
        }
        if (print) {
          console.log(line);
        }
        onData(line)
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
    execPtyResStore.kill = () => {
      // execRes.kill() is a Rust function.
      // So keep the ownership(Rust Concept) of execRes.
      execPtyRes.kill();
    };
  });
  result.kill = execPtyResStore.kill;

  return result;
}
