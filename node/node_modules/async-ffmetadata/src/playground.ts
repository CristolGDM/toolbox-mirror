import { getMetaDataFromFile } from "."
import * as path from 'path'

(async () => {
  const prom = await new Promise((resolve) => {
    const pathToFile = path.join(__dirname, '/tests/test.mp3')

    getMetaDataFromFile(pathToFile)
      .then((res) => {
        resolve(res)
      })
  })
  
  console.log('prom: ', prom)
})()