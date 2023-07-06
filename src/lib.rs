#![deny(clippy::all)]

mod pty;

use std::thread;

use napi::{
  bindgen_prelude::*,
  // threadsafe_function::{ErrorStrategy, ThreadsafeFunction, ThreadsafeFunctionCallMode},
  threadsafe_function::*,
  JsFunction,
};

#[macro_use]
extern crate napi_derive;

// #[napi]
// pub fn sum(a: i32, b: i32) -> i32 {
//   pty::pty();
//   a + b
// }

#[napi(ts_args_type = "callback: (err: null | Error, result: number) => void")]
pub fn call_threadsafe_function(callback: JsFunction) -> Result<()> {
  let tsfn: ThreadsafeFunction<u32, ErrorStrategy::CalleeHandled> = callback
    .create_threadsafe_function(0, |ctx| {
      ctx.env.create_uint32(ctx.value + 1).map(|v| vec![v])
    })?;
  for n in 0..100 {
    let tsfn = tsfn.clone();
    thread::spawn(move || {
      tsfn.call(Ok(n), ThreadsafeFunctionCallMode::Blocking);
    });
  }
  Ok(())
}

#[napi]
pub fn tmp() -> () {
  println!("{:#?}", shell_words::split("ls -al"));
}

#[napi(ts_args_type = "callback: (err: null | Error, result: number) => void")]
pub fn exec(callback: JsFunction) -> Result<()> {
  let tsfn: ThreadsafeFunction<String, ErrorStrategy::CalleeHandled> = callback
    .create_threadsafe_function(0, |ctx: ThreadSafeCallContext<String>| {
      ctx.env.create_string(&ctx.value).map(|v| vec![v])
    })?;
  // let tsfn = callback.create_threadsafe_function(0, |ctx: ThreadSafeCallContext<String>| {
  //   ctx.env.create_string(&ctx.value).map(|v| vec![v])
  // })?;
  pty::pty(move |line| {
    let tsfn = tsfn.clone();
    thread::spawn(move || {
      tsfn.call(Ok(line), ThreadsafeFunctionCallMode::NonBlocking);
    });
  });
  Ok(())
}
