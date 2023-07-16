import { setTimeout } from 'timers/promises'

for (let i = 0; i < 5; i++) {
  await setTimeout(1000)
  console.log(i.toString())
}
