use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::io::{BufRead, Read};
use std::{io::BufReader, sync::mpsc::channel};

pub fn pty(callback: impl Fn(String) -> () + Send + 'static) {
  let pty_system = NativePtySystem::default();
  let pair = pty_system
    .openpty(PtySize {
      rows: 24,
      cols: 80,
      pixel_width: 0,
      pixel_height: 0,
    })
    .expect("Failed to create PTY.");

  let argv = "ls -al";
  let argv = "node /Users/ocean/main/haetae/packages/utils/counter.js";
  //   let argv = "pnpm test";
  let cwd = "/Users/ocean/main/haetae/packages/utils";
  let mut cmd = CommandBuilder::from_argv(
    shell_words::split(argv)
      .unwrap()
      .iter()
      .map(|s| std::ffi::OsString::from(s))
      .collect(),
  );
  cmd.cwd(cwd);
  let mut child = pair.slave.spawn_command(cmd).unwrap();

  // Release any handles owned by the slave: we don't need it now
  // that we've spawned the child.
  drop(pair.slave);

  // Read the output in another thread.
  // This is important because it is easy to encounter a situation
  // where read/write buffers fill and block either your process
  // or the spawned process.
  let reader = pair.master.try_clone_reader().unwrap();

  let handle = std::thread::spawn(move || {
    let reader = BufReader::new(reader);
    for line in reader.lines() {
      match line {
        // TODO(QA): We print with escapes escaped because the windows conpty
        // implementation synthesizes title change escape sequences
        // in the output stream and it can be confusing to see those
        // printed out raw in another terminal.
        Ok(value) => callback(value),
        _ => break,
      }
    }
  });
  // Wait for the child to complete
  println!("child status: {:?}", child.wait().unwrap());
  //   handle.join().unwrap();
}
