try {
    const FormData = require('form-data');
    console.log("form-data found");
} catch (e) {
    console.log("form-data NOT found");
}

try {
    const axios = require('axios');
    console.log("axios found");
} catch (e) {
    console.log("axios NOT found");
}
