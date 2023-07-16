for (let i = 0; i < 5; i++) {
  console.log(i)
  if (i === 3) {
    throw new Error("i is 3!!!! Error!!!!")
  }
}
