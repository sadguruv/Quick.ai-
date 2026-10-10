
import { generateImageFromText } from "./utils/aiProviders.js";

async function test() {
    try {
        console.log("Testing Image Gen...");
        const result = await generateImageFromText("cute robot");
        console.log("Success! Length:", result.length);
        console.log("Head:", result.substring(0, 100));

        // Extract base64 and save
        const base64 = result.split(',')[1];
        if (base64) {
            import('fs').then(fs => fs.writeFileSync('debug_output.jpg', Buffer.from(base64, 'base64')));
            console.log("Saved debug_output.jpg");
        }
    } catch (e) {
        console.error("FAILED:", e);
    }
}

test();
