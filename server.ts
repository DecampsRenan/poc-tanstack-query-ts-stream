import express from 'express'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import cors from 'cors'

const app = express()
const port = 3001

const waitFor = (delayInMs: number) => new Promise((resolve) => setTimeout(resolve, delayInMs))

app.use(cors())

app.get('/', async (req, res) => {
  console.log('starting streaming response...')

  const fileContent = await readFile(resolve(process.cwd(), './text.txt'), { encoding: 'utf-8' })

  for (const chunk of fileContent) {
  res.write(JSON.stringify({ type: 'content', value: chunk, timestamp: Date.now() }))
    await waitFor(10)
  }

  res.end()
})

app.listen(port, () => {
  console.log(`Running server on port ${port}`)
})