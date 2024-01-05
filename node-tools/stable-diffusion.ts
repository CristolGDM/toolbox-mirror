import * as fs from "fs";
import { getFileNameWithoutExtension, logBlue, logGreen, oneHour, separator } from "./utils";
import axios from "axios";

const source = "L:/Pictures/upscale-test/source";
const destination = "L:/Pictures/upscale-test/destination";

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

export async function upscaleFolder(model: Upscaler, suffix: string) {
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
  response.images.forEach((image, index) => {
    const imageName = getFileNameWithoutExtension(images[index]);
    fs.writeFileSync(`${destination}/${imageName}_${suffix}.png`, image, {encoding: 'base64'});
  })
  return response;
}

export async function testModels() {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination);
  const images = fs.readdirSync(source);
  for(const image of images) {
    fs.writeFileSync(`${destination}/${image}`, image);
  }
  const upscalers: {model: string, suffix: string}[] = [
    {model: '4x_foolhardy_Remacri', suffix: "remacri"},
    {model: 'ESRGAN_4x', suffix: "esrgan"},
    {model: 'R-ESRGAN 4x+', suffix: "rEsrgan"},
    {model: 'SwinIR_4x', suffix: "swinIR"},
  ];
  // single tests
  for (const upscaler of upscalers) {
    logBlue("Running upscale for " + upscaler.model);
    await upscaleFolder({upscaler_1: upscaler.model}, upscaler.suffix);
  }
  logBlue(separator(16));
  logBlue("Finished single upscale");
  logBlue(separator(16));

  for (const mainUpscaler of upscalers) {
    for (const secondUpscaler of upscalers) {
      if(secondUpscaler.model === mainUpscaler.model) continue;
      const suffix = "zzz-"+mainUpscaler.suffix + "+" + secondUpscaler.suffix;
      logBlue("Running upscale for " + mainUpscaler.model + "/" + secondUpscaler.model);
      await upscaleFolder({upscaler_1: mainUpscaler.model, upscaler_2: secondUpscaler.model, extras_upscaler_2_visibility: 0.5}, suffix);
    }
  }
  logGreen(separator(16));
  logGreen("Finished upscale");
  logGreen(separator(16));
  return;
}

type BatchUpscalePayload = Upscaler & {
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
  "imageList": Image[] //List of images to work on. Must be Base64 strings
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