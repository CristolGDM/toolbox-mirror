import * as fs from "fs";
const stableDiffusionUrl = "http://127.0.0.1:7860";

async function makeRequestToAPI(method: "GET" | "POST", endpoint: string, payload?: unknown) {
  const body = method === "POST" ? {
    body: JSON.stringify(payload)
  } : {};
  const response = await fetch((stableDiffusionUrl + endpoint).replace("//", "/"), {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      ...body
    })

  // console.log(response);
  return await response.json();
}

async function getUpscalers() {
  const response = await makeRequestToAPI("GET", "/sdapi/v1/upscalers");
  return response
}

export async function upscaleFolder() {
  const source = "L:/Pictures/upscale-test/source-small";
  const destination = "L:/Pictures/upscale-test/destination";
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination);
  const images = fs.readdirSync(source);

  const payload: batchUpscalePayload = {
    resize_mode: 1,
    show_extras_results: true,
    gfpgan_visibility: 0,
    codeformer_visibility: 0,
    codeformer_weight: 0,
    upscaling_crop: false,
    upscaling_resize_w: 3840,
    upscaling_resize_h: 2160,
    upscaler_1: "R-ESRGAN 4x+",
    upscaler_2: "4x_foolhardy_Remacri",
    extras_upscaler_2_visibility: 0.5,
    upscale_first: false,
    imageList: images.map((imageName):Image => {
      return {
        data: fs.readFileSync(`${source}/${imageName}`, {encoding: 'base64'}),
        name: imageName
      }
    })
  }
  const response:batchUpscaleResponse = await makeRequestToAPI("POST", "/sdapi/v1/extra-batch-images", payload);
  response.images.forEach((image, index) => {
    fs.writeFileSync(`${destination}/${images[index]}`, image, {encoding: 'base64'});
  })
}

type batchUpscalePayload = {
  "resize_mode": 0 | 1, //Sets the resize mode: 0 to upscale by upscaling_resize amount, 1 to upscale up to upscaling_resize_h x upscaling_resize_w.
  "show_extras_results": boolean, //Should the backend return the generated image?
  "gfpgan_visibility": number,
  "codeformer_visibility": number,
  "codeformer_weight": number,
  "upscaling_resize"?: number, //By how much to upscale the image, only used when resize_mode=0.
  "upscaling_resize_w"?: number, //Target width for the upscaler to hit. Only used when resize_mode=1.
  "upscaling_resize_h"?: number, //Target height for the upscaler to hit. Only used when resize_mode=1.
  "upscaling_crop": boolean, //Should the upscaler crop the image to fit in the chosen size?
  "upscaler_1": string, //The name of the main upscaler to use
  "upscaler_2": string, //The name of the secondary upscaler to use
  "extras_upscaler_2_visibility": number,
  "upscale_first": false, //Should the upscaler run before restoring faces?
  "imageList": Image[] //List of images to work on. Must be Base64 strings
}

type Image = {
  data:	string; //Base64 representation of the file
  name:	string; //File name  
}

type batchUpscaleResponse = {
  html_info: string;
  images: string[];
}