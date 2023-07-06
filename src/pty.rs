use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::io::BufRead;
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
  let (tx, rx) = channel::<String>();
  let reader = pair.master.try_clone_reader().unwrap();
  std::thread::spawn(move || {
    // Consume the output from the child
    // let mut s = String::new();
    // reader.read_to_string(&mut s).unwrap();
    let reader = BufReader::new(reader);
    for line in reader.lines() {
      //   println!("{}", line.unwrap());
      match line {
        Ok(value) => tx.send(value).unwrap(),
        _ => break,
      }
    }
    // tx.send(s).unwrap();
  });

  {
    // Obtain the writer.
    // When the writer is dropped, EOF will be sent to
    // the program that was spawned.
    // It is important to take the writer even if you don't
    // send anything to its stdin so that EOF can be
    // generated, otherwise you risk deadlocking yourself.
    let mut writer = pair.master.take_writer().unwrap();

    if cfg!(target_os = "macos") {
      // macOS quirk: the child and reader must be started and
      // allowed a brief grace period to run before we allow
      // the writer to drop. Otherwise, the data we send to
      // the kernel to trigger EOF is interleaved with the
      // data read by the reader! WTF!?
      // This appears to be a race condition for very short
      // lived processes on macOS.
      // I'd love to find a more deterministic solution to
      // this than sleeping.
      std::thread::sleep(std::time::Duration::from_millis(20));
    }

    // This example doesn't need to write anything, but if you
    // want to send data to the child, you'd set `to_write` to
    // that data and do it like this:
    let to_write = "";
    if !to_write.is_empty() {
      // To avoid deadlock, wrt. reading and waiting, we send
      // data to the stdin of the child in a different thread.
      std::thread::spawn(move || {
        writer.write_all(to_write.as_bytes()).unwrap();
      });
    }
  }

  // Wait for the child to complete
  println!("child status: {:?}", child.wait().unwrap());

  // Take care to drop the master after our processes are
  // done, as some platforms get unhappy if it is dropped
  // sooner than that.
  drop(pair.master);

  std::thread::spawn(move || {
    loop {
      match rx.recv() {
        Ok(line) => callback(line), //println!("{:?}", value),
        _ => break,
      }
    }
  });

  // Now wait for the output to be read by our reader thread
  //   let output = rx.recv().unwrap();

  //   println!("{}", output);

  // We print with escapes escaped because the windows conpty
  // implementation synthesizes title change escape sequences
  // in the output stream and it can be confusing to see those
  // printed out raw in another terminal.
  print!("output: ");
  //   for c in output.escape_debug() {
  //     print!("{}", c);
  //   }
}
