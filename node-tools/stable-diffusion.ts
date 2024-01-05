import * as fs from "fs";
import { getFileNameWithoutExtension, logBlue, logGreen, logYellow, oneHour, separator } from "./utils";
import axios from "axios";
import * as sharp from "sharp";
import * as cliProgress from "cli-progress";
import * as colors from "ansi-colors";

// const defaultSource = "L:/Pictures/upscale-test/source";
const defaultSource = "L:/Pictures/upscale-test/source-small";
const defaultDestination = "L:/Pictures/upscale-test/destination";

const upscalers: {model: string, suffix: string}[] = [
  {model: '4x_foolhardy_Remacri', suffix: "remacri"},
  // {model: 'ESRGAN_4x', suffix: "esrgan"},
  // {model: 'R-ESRGAN 4x+', suffix: "rEsrgan"},
  // {model: 'SwinIR_4x', suffix: "swinIR"},
];

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

async function singleUpscale(model: Upscaler, imagePath: string) {
  const payload: SingleUpscalePayload = {
    resize_mode: 1,
    show_extras_results: true,
    gfpgan_visibility: 0,
    codeformer_visibility: 0,
    codeformer_weight: 0,
    upscaling_crop: false,
    upscaling_resize_w: 3840,
    upscaling_resize_h: 2160,
    ...model,
    upscale_first: false,
    image: fs.readFileSync(imagePath, {encoding: 'base64'}),
  }

  const response:SingleUpscaleResponse = await makeRequestToAPI("POST", "/sdapi/v1/extra-single-image", payload);

  return response.image;
}

async function upscaleFolder(source: string, destination: string, model: Upscaler, suffix?: string) {
  const images = fs.readdirSync(source);
  const startTime = new Date();
  const progressBar = new cliProgress.SingleBar({
    format: 'CLI Progress |' + colors.cyanBright('{bar}') + '| {percentage}% | {value}/{total} | Speed: {speed}s/img | ETA: {eta_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  console.clear();
  progressBar.start(images.length, 0, {speed: "N/A"});
  const done = [];
  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    const upscaledImage = await singleUpscale(model, `${source}/${image}`);
    const imageName = getFileNameWithoutExtension(image);
    const imgBuffer = Buffer.from(upscaledImage.split(';base64,').pop(), 'base64');
    await sharp(imgBuffer)
      .toFormat("jpeg")
      .jpeg({
        force: true
      })
      .toFile(`${destination}/${imageName}${suffix ? "_"+suffix : ""}.jpg`);
    done.push(image);
    
    const updatedTime = new Date().valueOf() - startTime.valueOf();
    const speed = (updatedTime / (1000*(index+1))).toFixed(2);
    console.clear();
    done.forEach((doneImage) => {logGreen(`Upscaled ${doneImage}`)});
    console.log("");
    progressBar.update(index+1, {speed: speed});
    console.log("");
  }
  progressBar.update(images.length);
  progressBar.stop();
}

async function batchUpscale(model: Upscaler, suffix: string, source: string, destination: string) {
  const images = fs.readdirSync(source);

  const payload: BatchUpscalePayload = {
    resize_mode: 1,
    show_extras_results: true,
    gfpgan_visibility: 0,
    codeformer_visibility: 0,
    codeformer_weight: 0,
    upscaling_crop: false,
    upscaling_resize_w: 3840,
    upscaling_resize_h: 2160,
    ...model,
    upscale_first: false,
    imageList: images.map((imageName):Image => {
      return {
        data: fs.readFileSync(`${source}/${imageName}`, {encoding: 'base64'}),
        name: imageName
      }
    })
  }
  const response:BatchUpscaleResponse = await makeRequestToAPI("POST", "/sdapi/v1/extra-batch-images", payload);

  for (let index = 0; index < response.images.length; index++) {
    const image = response.images[index];
    const imageName = getFileNameWithoutExtension(images[index]);
    const imgBuffer = Buffer.from(image.split(';base64,').pop(), 'base64');
    await sharp(imgBuffer)
      .toFormat("jpeg")
      .jpeg({
        force: true
      })
      .toFile(`${destination}/${imageName}_${suffix}.jpg`)
    }
  return response;
}

export async function testModels() {
  fs.rmSync(defaultDestination, { recursive: true, force: true });
  fs.mkdirSync(defaultDestination);
  // const images = fs.readdirSync(defaultSource);
  // for(const image of images) {
  //   fs.writeFileSync(`${defaultDestination}/${image}`, fs.readFileSync(`${defaultSource}/${image}`));
  // }
  // single tests
  for (const upscaler of upscalers) {
    logBlue("Running upscale for " + upscaler.model);
    await upscaleFolder(defaultSource, defaultDestination, {upscaler_1: upscaler.model}, upscaler.suffix);
    // await batchUpscale({upscaler_1: upscaler.model}, upscaler.suffix, defaultSource, defaultDestination);
  }
  logBlue(separator(16));
  logBlue("Finished single upscale");
  logBlue(separator(16));

  // for (const mainUpscaler of upscalers) {
  //   for (const secondUpscaler of upscalers) {
  //     if(secondUpscaler.model === mainUpscaler.model) continue;
  //     const suffix = "zzz-"+mainUpscaler.suffix + "+" + secondUpscaler.suffix;
  //     logBlue("Running upscale for " + mainUpscaler.model + "/" + secondUpscaler.model);
  //     await batchUpscale({upscaler_1: mainUpscaler.model, upscaler_2: secondUpscaler.model, extras_upscaler_2_visibility: 0.5}, suffix,defaultSource, defaultDestination);
  //   }
  // }
  logGreen(separator(16));
  logGreen("Finished upscale");
  logGreen(separator(16));
  return;
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

type BatchUpscalePayload = UpscalePayload & {
  "imageList": Image[]; //List of images to work on. Must be Base64 strings
}

type SingleUpscalePayload = UpscalePayload & {
  "image": string; // Image to work on, must be a Base64 string containing the image's data.
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