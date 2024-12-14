import app from './app.js'
import { APP_PORT } from './constants.js'
import neo4j from 'neo4j-driver'

// Listen
const port = APP_PORT



app.listen(port, async () => {
  console.log(`Server listening on http://localhost:${port}/`)
})
