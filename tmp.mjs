import {exec } from './index.js'

// console.log(sum(1, 2565652))
// callThreadsafeFunction((err, res) => {
//     console.log(res)
// })
// tmp();
exec((err, line) => {
  console.log(line)
})
