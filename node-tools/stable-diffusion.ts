import * as fs from "fs";
import { createFolder, deleteFolder, formatTimeStamp, getFileNameWithoutExtension, logBlue, logGreen, logRed, logYellow, oneHour, separator } from "./utils";
import axios, { AxiosError } from "axios";
import * as sharp from "sharp";
import * as cliProgress from "cli-progress";
import * as colors from "ansi-colors";
import { getUpscaleRatio } from "./upscaler";
import { mobileHeight, mobileWidth } from "./wallpapers";
import path = require("path");

// const defaultSource = "L:/Pictures/upscale-test/source";
const defaultSource = "L:/Pictures/upscale-test/source-small";
const defaultDestination = "L:/Pictures/upscale-test/destination";

const upscalers: {model: string, suffix: string}[] = [
  {model: '4x_foolhardy_Remacri', suffix: "remacri"},
  {model: 'ESRGAN_4x', suffix: "esrgan"},
  {model: 'R-ESRGAN 4x+', suffix: "rEsrgan"},
  {model: 'SwinIR_4x', suffix: "swinIR"},
];

const knownErrors = [
  "too many values to unpack (expected 3)",
  "not enough values to unpack (expected 3, got 2)",
  "not enough values to unpack (expected 3, got 1)",
  "unpack requires a buffer of 2 bytes",
  "cannot unpack non-iterable int object"
];

const unrecoverableErrors = [
  "image file is truncated (16 bytes not processed)"
]

axios.defaults.baseURL = 'http://127.0.0.1:7860';

async function makeRequestToAPI(method: "GET" | "POST", endpoint: string, payload?: unknown) {
  let response;

  if(method === "GET") {
    response = await axios.get(endpoint)
  }
  if(method === "POST") {
    response = await axios.post(endpoint, payload, {timeout: 12*oneHour});
  }

  return await response.data;
}

export async function getUpscalers() {
  const response = await makeRequestToAPI("GET", "/sdapi/v1/upscalers");
  return response
}

type TargetSize = {width: number, height: number, ratio?: never};
type TargetRatio = {ratio: number,width?: never, height?: never};
async function singleUpscaleRequest(model: Upscaler, imagePath: string, target: TargetSize | TargetRatio) {
  const targetParams: Partial<SingleUpscalePayload> = target.ratio ? {resize_mode: 0, upscaling_resize: target.ratio} 
  : {resize_mode: 1, upscaling_resize_w: target.width, upscaling_resize_h: target.height}

  const payload: SingleUpscalePayload = {
    resize_mode: 1,
    show_extras_results: true,
    gfpgan_visibility: 0,
    codeformer_visibility: 0,
    codeformer_weight: 0,
    upscaling_crop: false,
    ...targetParams,
    ...model,
    upscale_first: false,
    image: fs.readFileSync(imagePath, {encoding: 'base64'}),
  }

  try {
    const response:SingleUpscaleResponse = await makeRequestToAPI("POST", "/sdapi/v1/extra-single-image", payload);

    return response.image;
  } catch (error: any) {
    const axiosError: AxiosError = error;
    const errorData: {
      error: 'ValueError',
      detail: string,
      body: string,
      errors: string
    } = axiosError.response.data as any;
    return errorData.errors;
  }
}

async function folderUpscaleRequest(model: Upscaler, folderPath: string, target: TargetSize | TargetRatio): Promise<Image[]> {
  const targetParams: Partial<FolderUpscalePayload> = target.ratio ? {resize_mode: 0, upscaling_resize: target.ratio} 
  : {resize_mode: 1, upscaling_resize_w: target.width, upscaling_resize_h: target.height};

  const imagesNames = fs.readdirSync(folderPath);
  const images: Image[] = imagesNames.map((imageName) => {
    return {
      name: getFileNameWithoutExtension(imageName),
      data: fs.readFileSync(path.join(folderPath, imageName), "base64")
    }
  });

  logBlue(separator(16));
  logBlue(`Upscaling ${images.length} images...`)
  logBlue(separator(16));

  const payload: FolderUpscalePayload = {
    resize_mode: 1,
    show_extras_results: true,
    gfpgan_visibility: 0,
    codeformer_visibility: 0,
    codeformer_weight: 0,
    upscaling_crop: false,
    ...targetParams,
    ...model,
    upscale_first: false,
    imageList: images,
  }

  const response:BatchUpscaleResponse = await makeRequestToAPI("POST", "/sdapi/v1/extra-batch-images", payload);

  return response.images.map((image, index) => {return {
    data: image,
    name: images[index].name,
  }});
}

export async function TestFolderUpscale() {
  const sourceFolder = "L:/Pictures/wp-up/tempfolder";
  let startTime = new Date();
  const upscaler = {upscaler_1: '4x_foolhardy_Remacri'};
  await folderUpscaleRequest(upscaler, sourceFolder, {width: mobileWidth, height: mobileHeight});
  const endTime = new Date();
  const diffTime = endTime.valueOf() - startTime.valueOf();
  console.log(`It took ${formatTimeStamp(diffTime/1000)} (or ${formatTimeStamp(diffTime/10000)} per image)`)
}

type UpscaleFolderOptions = {suffix?: string, useRatio?: boolean, just2x?: boolean, just4x?: boolean, png?: boolean}
//one by one version
export async function upscaleFolderSDOneByOne(source: string, destination: string, model: Upscaler, width: number, height: number, options?: UpscaleFolderOptions) {
  const images = fs.readdirSync(source);
  const existingFiles = fs.readdirSync(destination).map(getFileNameWithoutExtension);
  const errorFolder = source.replace("toscale", "error");
  let startTime = new Date();
  let previousTime = new Date();
  let started = false;
  const progressBar = new cliProgress.SingleBar({
    format: 'CLI Progress |' + colors.cyanBright('{bar}') + '| {percentage}% | {value}/{total} | Speed: {speed} | ETA: {myEta}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    etaBuffer: 50,
  });
  console.log("");
  progressBar.start(images.length, 0, {speed: "N/A", myEta: "N/A"});
  let exists = 0;
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const imageName = getFileNameWithoutExtension(image);
    const imagePath = `${source}/${image}`;
    const newPath = `${destination}/${imageName}${options?.suffix ? "_"+options?.suffix : ""}.jpg`;
    let upscaledImage;
    let imgBuffer;

    //case where image already exists
    if(existingFiles.indexOf(getFileNameWithoutExtension(image)) > -1) {
      logRed(`Already exists: ${image}`);
      if(!started) {
        startTime = new Date();
        previousTime = new Date();
      }
      exists++;
      continue;
    }
    started = true;
    logGreen(`Upscaling ${image}`);

    //case where user gives fixed dimensions to target
    if(options?.useRatio) {
      const {width: imageWidth, height:imageHeight} = await sharp(imagePath).metadata();
      const ratio = getUpscaleRatio(width, height, imageWidth, imageHeight);
      upscaledImage = await singleUpscaleRequest(model, imagePath, {ratio});
    }

    //case where user just wants a 2x image
    else if(options?.just2x) {
      upscaledImage = await singleUpscaleRequest(model, imagePath, {ratio: 2});
    }

    //case where user just wants a 4x image
    else if(options?.just4x) {
      upscaledImage = await singleUpscaleRequest(model, imagePath, {ratio: 4});
    }

    //case where user gives an upscale ratio to target
    else {
      upscaledImage = await singleUpscaleRequest(model, imagePath, {width, height});
    }

    //case where the API returns an error
    if(knownErrors.indexOf(upscaledImage) > -1) {
      createFolder(errorFolder);
      logYellow("Moving to error folder due to: " + upscaledImage);
      const errorImagePath = `${destination}/${imageName}.${options?.png ? "png": "jpg"}`;
      await sharp(imagePath).toFormat(options?.png ? "png" : "jpeg")
      .jpeg({
        force: true
      }).toFile(errorImagePath);

      upscaledImage = await singleUpscaleRequest(model, errorImagePath, {width, height});
    }

    if(upscaledImage.indexOf(";base64,") === -1 && upscaledImage.length <= 200 ) {
      logRed(separator(16, "!"));
      logRed("Found error: "+ upscaledImage);
      logRed(separator(16, "!"));
    }

    //processing the image
    imgBuffer = Buffer.from(upscaledImage.split(';base64,').pop(), 'base64');
    await sharp(imgBuffer)
      .toFormat(options?.png ? "png" : "jpeg")
      .jpeg({
        force: true
      })
      .toFile(newPath);
    upscaledImage = null;
    imgBuffer = null;
    const updatedTime = (new Date().valueOf() - startTime.valueOf())/1000;
    const thisTime = (new Date().valueOf() - previousTime.valueOf())/1000;
    previousTime = new Date();
    const speed = updatedTime / (i+1 - exists);
    const leftTime = speed * (images.length - (i +1));
    const speedMessage = `${speed.toFixed(2)}s/img`;
    logGreen(`Current image took ${formatTimeStamp(thisTime)}`);
    progressBar.update(i+1, {speed: speedMessage, myEta: formatTimeStamp(leftTime)});
    console.log("");
    console.log("");
    }
  }
  
export async function upscaleFolderSD(source: string, destination: string, model: Upscaler, width: number, height: number, options?: UpscaleFolderOptions) {
  const images = fs.readdirSync(source);
  const existingFiles = fs.readdirSync(destination).map(getFileNameWithoutExtension);
  createFolder(destination, true);
  const processingFolder = source + "-processing";
  const BATCH_SIZE = 50;
  let startTime = new Date();
  let previousTime = new Date();
  const progressBar = new cliProgress.SingleBar({
    format: 'CLI Progress |' + colors.cyanBright('{bar}') + '| {percentage}% | {value}/{total} | {speed} | ETA: {myEta}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    etaBuffer: 50,
  });
  console.log("");
  progressBar.start(images.length, 0, {speed: "N/A", myEta: "N/A"});
  let exists = 0;
  
  for (let index = 0; index < images.length; index+=BATCH_SIZE) {
    const imageGroup = images.slice(index, index+BATCH_SIZE);
    let numberOfImages = 0;
    deleteFolder(processingFolder, {silent: true});
    createFolder(processingFolder, true);

    await Promise.all(imageGroup.map(async (image) => {
      const imageName = getFileNameWithoutExtension(image);
      if(existingFiles.indexOf(imageName) > -1) {
        exists++;
        return;
      }

      fs.writeFileSync((path.join(processingFolder, image)), fs.readFileSync(path.join(source, image)));
      numberOfImages++;
    }))

    if(numberOfImages === 0) {
      logRed(`Group ${index}-${index+BATCH_SIZE} already upscaled, continuing...`);
      startTime = new Date();
      previousTime = new Date();
      continue;
    }
    logGreen(`Group ${index}-${index+BATCH_SIZE} sent to upscaling`);
    const upscaledImages = await folderUpscaleRequest(model, processingFolder, {width, height});

    await Promise.all(upscaledImages.map(async (image) => {
      const imgBuffer = Buffer.from(image.data.split(';base64,').pop(), 'base64');
      const newPath = `${destination}/${image.name}.jpg`;
      await sharp(imgBuffer)
          .toFormat("jpeg")
          .jpeg({
            force: true
          })
          .toFile(newPath);
    }))

    const totalTime = (new Date().valueOf() - startTime.valueOf())/1000;
    const thisGroupTime = (new Date().valueOf() - previousTime.valueOf())/1000;
    previousTime = new Date();
    const speed = totalTime / (index+BATCH_SIZE - exists);
    const groupSpeed = thisGroupTime / numberOfImages;
    const leftTime = speed * (images.length - (index+BATCH_SIZE));
    const speedMessage = `${speed.toFixed(2)}s/img`;
    logGreen(`Current group took ${formatTimeStamp(thisGroupTime)} (${groupSpeed.toFixed(2)}/img)`);
    progressBar.update(index+1, {speed: speedMessage, myEta: formatTimeStamp(leftTime)});
    console.log("");
    console.log("");

    const tempFiles = fs.readdirSync("L:/Pictures/wp-up");
    const stopFile = tempFiles.find((file) =>{return file.startsWith("stop")});
    if(stopFile) {
      console.log(stopFile);
      logRed("=== ABORTING ===");
      return;
    }
  }
}

/* TYPES */

type UpscalePayload = Upscaler & {
  "resize_mode": 0 | 1, //Sets the resize mode: 0 to upscale by upscaling_resize amount, 1 to upscale up to upscaling_resize_h x upscaling_resize_w.
  "show_extras_results": boolean, //Should the backend return the generated image?
  "gfpgan_visibility": number,
  "codeformer_visibility": number,
  "codeformer_weight": number,
  "upscaling_resize"?: number, //By how much to upscale the image, only used when resize_mode=0.
  "upscaling_resize_w"?: number, //Target width for the upscaler to hit. Only used when resize_mode=1.
  "upscaling_resize_h"?: number, //Target height for the upscaler to hit. Only used when resize_mode=1.
  "upscaling_crop": boolean, //Should the upscaler crop the image to fit in the chosen size?
  "upscale_first": false, //Should the upscaler run before restoring faces?
}

type SingleUpscalePayload = UpscalePayload & {
  "image": string; // Image to work on, must be a Base64 string containing the image's data.
}

type FolderUpscalePayload = UpscalePayload & {
  "imageList": Image[]
}

type Upscaler = {
  "upscaler_1": string, //The name of the main upscaler to use
  "upscaler_2"?: string, //The name of the secondary upscaler to use
  "extras_upscaler_2_visibility"?: number,
}

type Image = {
  data:	string; //Base64 representation of the file
  name:	string; //File name  
}

type BatchUpscaleResponse = {
  html_info: string;
  images: string[];
}

type SingleUpscaleResponse = {
  html_info: string;
  image: string;
}