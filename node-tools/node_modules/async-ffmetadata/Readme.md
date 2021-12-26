# async-ffmetadata

![Github License](https://img.shields.io/badge/license-MIT-green)
![Github Issues](https://img.shields.io/github/issues/honjes/async-ffmetadata)

async-ffmetadata is a module that gives you the possability to edit metadata for music and video files using the ffmpeg cli with nodejs

## Table of content

- [**Getting Started**](#getting-started)
- [Contributing](#contributing)
- [License](#license)
- [Get Help](#get-help)
- [Motivation](#motivation)
- [Alternative](#alternative)

## Getting Started

### Prerequisit
To run this nodemodule you need to install ffmpeg on you machine. It can be downloaded from here: [ffmpeg Download](https://ffmpeg.org/download.html)

### Install
```console
npm i async-ffmetadata
// or
yarn add async-ffmetadata
```

### Usage
```javascript
import { getMetaDataFromFile, setMetaDataToFile } from 'async-ffmetadata'

const inFilePath = "/path/to/File"

// Gives back the metadata of the file as object
getMetaDataFromFile(inFilePath)
  .then((metaData) => {
    console.log(metaData)
  })

const outFilePath = "/path/to/NewFile"
const metaData = {
  title: "New Cool title"
}

// Saves the File as Copy with the added Metadata
setMetaDataToFile(metaData, inFilePath, outFilePath)
  .then((success) => {
    if (success === true) console.log("File written")
    else if (success === false) console.log("File not written")
  })
```
## Contributing

#### Issues
In the case of a bug report, bugfix or a suggestions, please feel very free to open an issue.

#### Pull request
Pull requests are always welcome, and I'll do my best to do reviews as fast as I can.

## License

This project is licensed under the [MIT License](https://github.com/this/project/blob/master/LICENSE)

## Get Help
- Contact me on Samuel.papke@protonmail.com
- If appropriate, [open an issue](https://github.com/honjes/async-ffmetadata/issues) on GitHub

## Motivation
I searched for a easy to use way to write and read metadata with nodejs for a diffrent project. So i made this.

## Alternative
- [node-taglib2](https://github.com/voltraco/node-taglib2)
- [mediainfo-wrapper](https://github.com/vankasteelj/mediainfo-wrapper)
- [node-ffmetadata](https://github.com/parshap/node-ffmetadata#readme)