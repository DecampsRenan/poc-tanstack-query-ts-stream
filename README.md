## POC Tanstack stream with real server

```sh
npm i
npx tsx ./server.ts

# In another shell
npm run dev
```

Interesting code is located at the `src/App.tsx` file.

Server code is here: `server.ts` and it streams each letter of `text.txt` as a chunk.