import ky from 'ky';
import z from 'zod';
import './App.css';
import { queryOptions, useQuery, experimental_streamedQuery as streamedQuery } from '@tanstack/react-query';

const textDecoder = new TextDecoder('utf-8');

interface ReadableStream<R = any> {
  [Symbol.asyncIterator](): AsyncIterableIterator<R>;
}

const zChunk = () => z.object({
  type: z.enum(['content']),
  value: z.string(),
  timestamp: z.coerce.date()
});

function parserGenerator() {
  return {
    async *[Symbol.asyncIterator]() {
      const response = await ky.get('http://localhost:3001/');
      
      if (!response.ok || !response.body) throw Error('Response ko');
      const body = response.body as unknown as ReadableStream<Uint8Array>;
      
      for await (const chunk of body) {
        const textChunk = textDecoder.decode(chunk);
        console.log({textChunk})

        try {  
          const rawObj = JSON.parse(textChunk);
          console.log({rawObj})
          yield zChunk().parse(rawObj); // zod allow the object to be typed correctly here
        } catch (error) {
          // silently catch errors here, so the frontend is not broken
          // 
          console.log(error)
        }
      }
    },
  }
}

const useStreamedResponse = () => useQuery(queryOptions({
  queryKey: ['static-key'],
  queryFn: streamedQuery({
    queryFn: () => parserGenerator()
  })
}));

function App() {
  const {  data, isFetching: isStreaming, isPending, isError, error } = useStreamedResponse();
  console.log({ data, isStreaming, isPending, isError, error });
  return (
    <div>
      <p>{data?.map(d => d.value).join('')}</p>
    </div>
  );
}

export default App;
