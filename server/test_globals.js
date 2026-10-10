console.log("Node Version:", process.version);
console.log("Global fetch:", typeof fetch);
console.log("Global FormData:", typeof FormData);
try {
    const blob = new Blob(["test"]);
    console.log("Global Blob:", typeof Blob);
} catch (e) {
    console.log("Global Blob: undefined");
}
