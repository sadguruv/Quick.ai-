
import { runAI } from "./ai/engine.js";

async function test() {
    try {
        console.log("Testing runAI...");
        const result = await runAI("Test prompt for blog titles");
        console.log("Success:", result);
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
