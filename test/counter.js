import { setTimeout } from 'timers/promises'

for (let i = 0; i < 5; i++) {
  console.log(i.toString())
  if (i === 3) {
    await setTimeout(30 * 1000)
  }
}
