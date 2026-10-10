export function matchesTopic(content, topic) {
    if (!content || !topic) return false;
    const t = topic.trim().toLowerCase();
    // Simple check: content should contain at least partial topic match
    const words = t.split(' ').filter(w => w.length > 3);
    if (words.length === 0) return true; // Fallback for short topics

    const contentLower = content.toLowerCase();
    // Check if at least one significant word from topic exists in content
    return words.some(w => contentLower.includes(w)) || contentLower.includes(t);
}

export function matchesKeyword(titles, keyword) {
    if (!titles || !Array.isArray(titles) || !keyword) return false;
    const k = keyword.trim().toLowerCase();

    // Semantic Check: Match significant words, not exact phrase
    const words = k.split(/\s+/).filter(w => w.length > 3);

    // If keyword has no long words (e.g. "AI", "cat"), allow anything or check exact?
    // User wants "poor" (4 chars) to pass. "cat" (3 chars) -> skip check?
    if (words.length === 0) return true;

    // Check if at least one title contains at least one significant keyword token
    return titles.some(t => {
        const titleLower = t.toLowerCase();
        return words.some(w => titleLower.includes(w));
    });
}
