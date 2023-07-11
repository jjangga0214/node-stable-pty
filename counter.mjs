import fs from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'

const timestamp = Date.now()

await fs.appendFile(new URL('counter.txt', import.meta.url), `\n`)
for (let i = 0; i < 5; i++) {
  await setTimeout(1000)
  if (i === 4) {
    // throw new Error('Error in counter')
  }
  console.log(i, 'seconds passed'.repeat(30))
  await fs.appendFile(new URL('counter.txt', import.meta.url), `${timestamp} ${i}\n`)
}
