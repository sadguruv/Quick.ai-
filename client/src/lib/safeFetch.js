/**
 * Safe fetch wrapper with exponential backoff and normalized error handling.
 * @template T
 * @param {string} url - Endpoint URL
 * @param {RequestInit} init - Fetch options
 * @param {number} [maxRetries=3] - Maximum number of retries
 * @returns {Promise<{ data?: T; error?: { code: number; message: string; hint?: string; retryCount: number } }>}
 */
export async function safeFetch(url, init, maxRetries = 3) {
    let attempt = 0;
    const backoffDelays = [300, 600, 1200]; // Defined backoff delays

    // Ensure base URL is applied if not absolute
    const fullUrl = url.startsWith('http') ? url : (import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000') + url;

    while (attempt <= maxRetries) {
        try {
            const res = await fetch(fullUrl, init);

            if (!res.ok) {
                // Determine hint based on status
                const hint = res.status === 404 ? 'Endpoint not found' :
                    res.status === 401 ? 'Unauthorized. Please check your login.' :
                        res.status === 429 ? 'Too many requests. Please wait.' :
                            res.status >= 500 ? 'Server error. We are fixing it.' : 'Request failed';

                // Do not retry client errors (4xx) except 429 using the retry loop
                // 401/403/404 should usually fail fast, but we return a standardized error
                if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                    const msg = await res.text().catch(() => 'Error');
                    let jsonMsg = msg;
                    try {
                        const parsed = JSON.parse(msg);
                        jsonMsg = parsed.message || msg;
                    } catch (e) { }

                    return { error: { code: res.status, message: jsonMsg, hint, retryCount: attempt } };
                }

                // For 5xx or 429, we might throw to trigger retry logic
                throw { code: res.status, message: await res.statusText, hint };
            }

            const data = await res.json();
            return { data };

        } catch (e) {
            // Check if we should retry
            if (attempt < maxRetries) {
                const delay = backoffDelays[attempt] || 1200; // Cap at 1200 or use logic
                await new Promise(r => setTimeout(r, delay));
                attempt++;
            } else {
                // Final failure
                const msg = e.message || 'Network/Server error';
                let jsonMsg = msg;
                try {
                    const parsed = JSON.parse(msg);
                    jsonMsg = parsed.message || msg;
                } catch { }

                return { error: { code: e.code ?? 0, message: jsonMsg, hint: e.hint || 'Check your connection', retryCount: attempt } };
            }
        }
    }
    return { error: { code: 0, message: 'Unknown error', retryCount: maxRetries } };
}
