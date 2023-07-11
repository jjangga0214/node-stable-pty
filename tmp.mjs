import { setTimeout } from 'node:timers/promises'
import { exec } from './index.js'

// export interface ExecOptions {
//     print: boolean
// }

function execpty(command, {
    cwd = process.cwd(),
    print = true
} = {}
    // : ExecOptions
) {
    const res = {}
    const result = new Promise((resolve, reject) => {

        const lines = []
        const execRes = exec(command, cwd, (err, line) => {
            if (err) {
                reject(err) // This does not mean stderr. This means something wrong happens in rust's side.
            }
            if (print) {
                console.log(line)
            }
            lines.push(line)
        }, (err, exitCode) => {
            if (err) {
                reject(err)
            }
            const res = {
                output: lines.join('\n'),
                exitCode,
            }
            if (exitCode !== 0) {
                const error = new Error()
                reject({ ...error, ...res })
            }
            resolve(res)
        })
        // execRes.kill() is a Rust function.
        // So keep the ownership(Rust Concept) of execRes.
        res.kill = () => {
            execRes.kill()
        }
    })

    res.result = result
    return res
}

const { kill, result } = execpty('node /Users/ocean/exp/stable-pty/counter.mjs',)

await setTimeout(2000)
console.log(kill)
// kill()
console.log(await result)
