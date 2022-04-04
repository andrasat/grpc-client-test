import { Client } from 'base-microservice-core/lib/external'
import cors, { CorsOptions } from 'cors'
import express from 'express'

const app = express()


const corsOption: CorsOptions = {
  origin: true,
  preflightContinue: true,
}

app.use(cors(corsOption))
app.options('*', cors(corsOption))

const client = new Client('local-api', undefined, {
  serverMode: 'development',
  enableInternalLoadBalancer: true,
})

client.registerClient('local-service')

function getMessage() {
  return client.sendRequest('local-service', 'getMessage')
}

async function infiniteLoop() {
  const startTime = process.hrtime()

  try {
    const result = await Promise.allSettled(Array.from({ length: 10 }).map(async () => {
      await getMessage()
    }))

    console.log('result: ', result)
  } catch(err) {
    console.log('err: ', err)
  } finally {
    const endTime = process.hrtime(startTime)
    console.log('\nlocalhost/message')
    console.log('\nExec time: %dms', endTime[1] / 1000000)
    console.log('Memory usage:', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), '\n')

    setTimeout(infiniteLoop, 1000)
  }
}

app.get('/infinite', async (_, res) => {
    process.nextTick(() => infiniteLoop())
    return res.send('INFINITE LOOP')
})
app.get('/message', async (_, res) => {
  const data = await getMessage()
  return res.send(data)
})
app.get('/', (_, res) => res.sendStatus(200))
app.use((_, res) => res.sendStatus(404))

const server = app.listen(process.env.PORT, () => {
  process.stdout.write(`API RUNNING AT PORT: ${process.env.PORT} \n`)
})

process.on('SIGTERM', async () => {

  server.close(err => {
    if (err) {
      process.stderr.write(`${err.stack} \n`)
      process.exit(1)
    }

    process.exit(0)
  })
})