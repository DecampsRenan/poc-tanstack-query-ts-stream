import ky from 'ky'
import './App.css'
import { queryOptions, useQuery, experimental_streamedQuery as streamedQuery } from '@tanstack/react-query'

const textDecoder = new TextDecoder('utf-8')

interface ReadableStream<R = any> {
  [Symbol.asyncIterator](): AsyncIterableIterator<R>;
}

function parserGenerator() {
  console.log('start streaming generator')
  return {
    async *[Symbol.asyncIterator]() {
      console.log('start streaming')
      const response = await ky.get('http://localhost:3001/')
      
      if (!response.ok || !response.body) throw Error('Response ko')
      const body = response.body as unknown as ReadableStream<Uint8Array>
      
      for await (const chunk of body) {
        yield JSON.parse(textDecoder.decode(chunk))
      }
    },
  }
}

const useStreamedResponse = () => useQuery(queryOptions({
  queryKey: ['static-key'],
  queryFn: streamedQuery({
    queryFn: () => parserGenerator()
  })
}))

function App() {
  const {  data, isFetching: isStreaming, isPending} = useStreamedResponse()
  console.log({ data, isStreaming, isPending })
  return (
    <div>
      <p>{data?.map(d => d.value).join('')}</p>
    </div>
  )
}

export default App
