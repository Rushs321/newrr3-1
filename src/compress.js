"use strict";
import sharp from 'sharp';
import { redirect } from './redirect.js';

// Define the sharpStream function
const sharpStream = () => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

export async function compressImg(request, reply, input) {
    const format = request.params.webp ? 'webp' : 'jpeg';

    try {
        // Create the Sharp instance with the specified options
        const sharpInstance = sharpStream()
            .grayscale(request.params.grayscale)
            .toFormat(format, {
                quality: request.params.quality,
                progressive: true,
                optimizeScans: true
            });

        // Pipe the input stream into the Sharp instance and await the result as a buffer
        const { data, info } = await input.body.pipe(sharpInstance).toBuffer({ resolveWithObject: true });

        // Send the processed image as the response
        reply
            .header('content-type', 'image/' + format)
            .header('content-length', info.size)
            .header('x-original-size', request.params.originSize)
            .header('x-bytes-saved', request.params.originSize - info.size)
            .code(200)
            .send(data);
    } catch (error) {
        // In case of an error, redirect the request
        return redirect(request, reply);
    }
}
