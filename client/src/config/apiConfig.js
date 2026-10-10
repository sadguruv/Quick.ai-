const apiConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
    imageApiKey: import.meta.env.VITE_IMAGE_API_KEY,
    backgroundApiKey: import.meta.env.VITE_BACKGROUND_API_KEY,
};

export const getApiKey = (service) => {
    if (service === 'image') {
        if (!apiConfig.imageApiKey) {
            console.warn("VITE_IMAGE_API_KEY is missing via apiConfig");
        }
        return apiConfig.imageApiKey;
    }
    if (service === 'background') {
        if (!apiConfig.backgroundApiKey) {
            console.warn("VITE_BACKGROUND_API_KEY is missing via apiConfig");
        }
        return apiConfig.backgroundApiKey;
    }
    return null;
};

export default apiConfig;
