import { setTimeout } from 'node:timers/promises'

for (let i = 0; i < 5; i++) {
  await setTimeout(1000)
  process.stdout.write(i + " ")
}
