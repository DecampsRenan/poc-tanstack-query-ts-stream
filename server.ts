import express from 'express';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import cors from 'cors';

const app = express();
const port = 3001;

const waitFor = (delayInMs: number) => new Promise((resolve) => setTimeout(resolve, delayInMs));

app.use(cors());

app.get('/', async (req, res) => {
  console.log('starting streaming response...');

  const fileContent = await readFile(resolve(process.cwd(), './text.txt'), { encoding: 'utf-8' });

  for (const chunk of fileContent) {
    const serializedChunk = JSON.stringify({ type: 'content', value: chunk, timestamp: Date.now() })
    console.log(`==> Sending chunk ${serializedChunk}`)

    // [NOTE] There is an issue here
    // the write is not instantly effective; in a real world scenario
    // the chunk is not directly sent to the client
    // Instead it is buffered by the lib and once the chunkSize is reached,
    // it is sent.
    // So there is some cases where the client could receive this kind of data:
    // `{key:"value"}{key:"value"}{key:"value"}` = 1 chunk
    // instead of
    // `{key:"value"}` = 1 chunk
    // `{key:"value"}` = 1 chunk
    // `{key:"value"}` = 1 chunk
    //
    // This could lead to JSON.parse issues on the client.
    res.write(serializedChunk); // Here we could specify the encoding to be utf-8, so the client will not need to parse it
    await waitFor(10);
  }

  res.end();

  console.log('ended\n\n');
})

app.listen(port, () => {
  console.log(`Running server on port ${port}`);
});