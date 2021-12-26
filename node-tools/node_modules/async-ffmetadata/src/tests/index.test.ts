import * as assert from "assert"
import { getExecString, getMetaDataFromFile, setMetaDataToFile } from '../index'
import * as ffmetadata from '../index'
const fs = require('fs')
const path = require('path')

describe('getExecString: ', () => {
  it('Basic Functionality', () => {
    const result = getExecString('testcom', [
      {
        name: "t",
        value: "test"
      }
    ])
    const expected = "testcom -t test"

    assert.strictEqual(result, expected)
  })
  it('Basic Functionality - multiple attributes', () => {
    const result = getExecString('testcom', [
      {
        name: "t",
        value: "test"
      },
      {
        name: "d",
        value: "tert"
      },
      {
        name: "x",
        value: "tunt"
      }
    ])
    const expected = "testcom -t test -d tert -x tunt"

    assert.strictEqual(result, expected)
  })
  it('empty attributes name and/or value', () => {
    const result = getExecString('testcom', [
      {
        name: "",
        value: "test"
      },
      {
        name: "d",
        value: ""
      },
      {
        name: "",
        value: ""
      }
    ])
    const expected = "testcom test -d"

    assert.strictEqual(result, expected)
  })
})

describe('getMetaDataFromFile', () => {
  it('Basic Functionality - Should return Object with Metadata', async () => {

    const pathToFile = path.join(__dirname, 'test.mp3')

    const result = await getMetaDataFromFile(pathToFile)
    const expected = {
      albumArtist: 'AlbumInterpret',
      encoder: 'Lavf58.45.100',
      title: 'TestTitle',
      track: '1'
    }

    assert.deepStrictEqual(expected, result)
  })
  it('Diffrent Import - Should return Object with Metadata D', async () => {
    const pathToFile = path.join(__dirname, 'test.mp3')

    const result = await ffmetadata.getMetaDataFromFile(pathToFile)
    const expected = {
      albumArtist: 'AlbumInterpret',
      encoder: 'Lavf58.45.100',
      title: 'TestTitle',
      track: '1'
    }

    assert.deepStrictEqual(expected, result)
  })
  it('File not There - Should return empty Object', async () => {
    const pathToFile = path.join(__dirname, 'NotThere.mp3')

    const result = await getMetaDataFromFile(pathToFile)
    const expected = {}

    assert.deepStrictEqual(expected, result)
  })
  it('File not There [DiffrentImport] - Should return empty Object', async () => {
    const pathToFile = path.join(__dirname, 'NotThere.mp3')

    const result = await ffmetadata.getMetaDataFromFile(pathToFile)
    const expected = {}

    assert.deepStrictEqual(expected, result)
  })
}).timeout(4000).slow("2s")

describe('setMetaDataToFile', () => {
  it('Basic Functionlity - Should return true', async () => {
    const pathToFile = path.join(__dirname, 'test.mp3')
    const pathToSaveFile = path.join(__dirname, '__test.mp3')

    const result = await setMetaDataToFile({
      album: 'Test Album'
    }, pathToFile, pathToSaveFile)
    const expected = true

    const resultMetaData = await getMetaDataFromFile(pathToSaveFile)
    const expectedMetaData = {
      album: 'Test Album',
      albumArtist: 'AlbumInterpret',
      encoder: 'Lavf58.45.100',
      title: 'TestTitle',
      track: '1'
    }

    assert.strictEqual(result, expected)
    assert.deepStrictEqual(expectedMetaData, resultMetaData)

    // Clen Up Test
    fs.unlinkSync(pathToSaveFile)
  })
  it('File not There - Should return false', async () => {
    const pathToFile = path.join(__dirname, 'NotThere.mp3')
    const pathToSaveFile = path.join(__dirname, 'NotThere2.mp3')

    const result = await setMetaDataToFile({
      album: 'Test Album'
    }, pathToFile, pathToSaveFile)
    const expected = false

    assert.strictEqual(expected, result)
  })
  it('Input same as Output - Should return false', async () => {
    const pathToFile = path.join(__dirname, 'test.mp3')

    const result = await setMetaDataToFile({
      album: 'Test Album'
    }, pathToFile, pathToFile)
    const expected = false

    assert.strictEqual(expected, result)
  })
})