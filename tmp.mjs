import { setTimeout } from 'node:timers/promises'
import { exec } from './index.js'
import { escape } from 'node:querystring'

console.log(2)
// console.log(sum(1, 2565652))
// callThreadsafeFunction((err, res) => {
//     console.log(res)
// })
// tmp();
let res = 'hi'
const arr = []
exec((err, line) => {
    // process.stdout.write(line);
    console.log(line,)
    // console.log(escape(line))
    res += line
    arr.push(line)
    // console.log(res)t
})
console.log(1)
await setTimeout(3000)
// for (const line of arr) {
//     console.log(line)
//     await setTimeout(100)
// }
console.log(arr.length)
console.log(arr.join('\n'))
// console.log(res)
