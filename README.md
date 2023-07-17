# stable-pty

An alternative to Node.js's built-in `child_process.exec` or `child_process.spawn`, with PTY support

```bash
npm install stable-pty
```

## What is PTY?

PTY means [Pseudoterminal](https://en.wikipedia.org/wiki/Pseudoterminal).

## Why?

Node.js doesn't natively support creating PTY. ANSI colors are lost with `child_process.exec` because most of CLIs disable colors when they aren't run inside a TTY environment. To preserve colors, you can make your child inherit the parent stdio with `child_process.spawn`, but this results in the inability to capture outputs.

`stable-pty` can simultaneously capture and print outputs in realtime.

Some other packages like [`node-pty`](https://github.com/microsoft/node-pty) aim to solve this problem too. But they rely on [`node-gyp`](https://github.com/nodejs/node-gyp), which is very sensitive to environments, having many issues. For example, `node-pty` cannot support newer node.js versions. It also misses and doesn't guarantee much range of compatibility. Even maintainers are not sure if it works in another environment.

Here's where `stable-pty` comes in.

## Benefits

- __Compatibility__: Every node.js version of >=16 is compatible.
(<small>Note that this cannot be guaranteed with other packages like `node-pty`.</small>)

- __Cross-Platform__: macOS, Linux, and Windows are all supported.

- __Stability__: `stable-pty` consumes Node.js's [N-API](https://medium.com/the-node-js-collection/n-api-next-generation-node-js-apis-for-native-modules-169af5235b06), the official stable native addon API, which is recommended over the old way of writing C/C++ code directly depending on V8 and/or [NAN](https://github.com/nodejs/nan) APIs. `stable-pty` is written in Rust, free from weird memory issues. `stable-pty` ships portable PTY, so you don't have to experience subtle unreproducible issues depending on the different environment.

## License

MIT License. Copyright © 2023, GIL B. Chan <github.com/jjangga0214> <bnbcmindnpass@gmail.com>

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjjangga0214%2Fnode-stable-pty.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjjangga0214%2Fnode-stable-pty?ref=badge_large)
