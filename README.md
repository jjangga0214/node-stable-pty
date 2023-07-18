# stable-pty

An alternative to Node.js `child_process.exec` or `child_process.spawn`, with [PTY](https://en.wikipedia.org/wiki/Pseudoterminal) support.

```bash
npm install stable-pty
yarn add stable-pty
pnpm add stable-pty
```

## Why?

Node.js doesn't natively support creating PTY. ANSI colors are lost with `child_process.exec` because most of CLIs disable colors when they aren't run inside a TTY environment. To preserve colors, you can make your child inherit the parent stdio with `child_process.spawn`, but this results in the inability to capture outputs.

`stable-pty` can simultaneously print and get outputs string with ANSI colors in real-time.

Some other packages like [`node-pty`](https://github.com/microsoft/node-pty) aim to solve this problem too. But they rely on [`node-gyp`](https://github.com/nodejs/node-gyp), which is very sensitive to environments, having many issues. For example, `node-pty` cannot support newer Node.js versions. It also misses and doesn't guarantee much range of compatibility. Even maintainers are not sure if it works in another environment.

Here's where `stable-pty` comes in.

## Benefits

- __Compatibility__: *Every* Node.js version of >=16 is compatible.
*(Note that other packages like `node-pty` cannot guarantee this level of compatibility.)*
- __N-API__: `stable-pty` only depends on Node.js [N-API](https://medium.com/the-node-js-collection/n-api-next-generation-node-js-apis-for-native-modules-169af5235b06), the official stable native addon API. It is recommended over the old way of writing C/C++ code directly depending on V8 and/or [NAN](https://github.com/nodejs/nan) APIs.
- __Portable PTY__: `stable-pty` ships portable PTY internally, so you don't have to experience subtle unreproducible issues depending on the different environment.
- __Cross-Platform__: macOS, Linux, and Windows are all supported.
- __Written in Rust__: Free from weird memory issues.

## License

MIT License. Copyright © 2023, GIL B. Chan <github.com/jjangga0214> <bnbcmindnpass@gmail.com>

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjjangga0214%2Fnode-stable-pty.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjjangga0214%2Fnode-stable-pty?ref=badge_large)
