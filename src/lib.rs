#![deny(clippy::all)]
#[macro_use]
extern crate napi_derive;

use napi::{threadsafe_function::*, JsFunction};
use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::{
  io::{BufRead, BufReader},
  sync::{Arc, RwLock},
};

#[napi]
pub struct ExecResult {
  _kill: Box<dyn Fn()>,
}

#[napi]
impl ExecResult {
  #[napi]
  pub fn kill(&self) {
    let k = &self._kill;
    k();
  }
}

#[napi(
  ts_args_type = "argv: string, cwd: string, onLine: (err: null | Error, result: string) => void, onExit: (err: null | Error, result: number) => void"
)]
pub fn exec_pty(argv: String, cwd: String, on_line: JsFunction, on_exit: JsFunction) -> ExecResult {
  let on_line: ThreadsafeFunction<String, ErrorStrategy::CalleeHandled> = on_line
    .create_threadsafe_function(0, |ctx: ThreadSafeCallContext<String>| {
      ctx.env.create_string(&ctx.value).map(|v| vec![v])
    })
    .unwrap();
  let on_line = move |value: String| on_line.call(Ok(value), ThreadsafeFunctionCallMode::Blocking);

  let on_exit: ThreadsafeFunction<u32, ErrorStrategy::CalleeHandled> = on_exit
    .create_threadsafe_function(0, |ctx: ThreadSafeCallContext<u32>| {
      ctx.env.create_uint32(ctx.value).map(|v| vec![v])
    })
    .unwrap();
  let on_exit = move |value: u32| on_exit.call(Ok(value), ThreadsafeFunctionCallMode::Blocking);

  let pty_system = NativePtySystem::default();
  let pair = pty_system
    .openpty(PtySize {
      rows: 24,
      cols: 80,
      pixel_width: 0,
      pixel_height: 0,
    })
    .expect("Failed to create PTY.");

  let argv = if cfg!(windows) {
    "cmd /c ".to_owned() + &argv
  } else {
    argv
  };

  let mut cmd = CommandBuilder::from_argv(
    shell_words::split(&argv)
      .unwrap()
      .iter()
      .map(|s| std::ffi::OsString::from(s))
      .collect(),
  );
  cmd.cwd(cwd);
  let child = pair.slave.spawn_command(cmd).unwrap();
  let child = Arc::new(RwLock::new(child));
  let child_copy = child.clone();
  // Release any handles owned by the slave: we don't need it now
  // that we've spawned the child.
  drop(pair.slave);

  let reader = pair.master.try_clone_reader().unwrap();
  // Read the output in another thread.
  // This is important because it is easy to encounter a situation
  // where read/write buffers fill and block either your process
  // or the spawned process.
  std::thread::spawn(move || {
    let reader = BufReader::new(reader);
    for line in reader.lines() {
      match line {
        // TODO(QA): escaping because the windows conpty
        // implementation synthesizes title change escape sequences
        // in the output stream and it can be confusing to see those
        // printed out raw in another terminal.
        Ok(value) => {
          on_line(value);
        }
        _ => break,
      }
    }
    let status = child.write().unwrap().wait().unwrap();
    on_exit(status.exit_code());
  });

  ExecResult {
    _kill: Box::new(move || {
      let _ = child_copy.write().unwrap().kill();
    }),
  }
}
