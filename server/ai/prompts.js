export const prompts = {
    article: ({ topic, length, tone }) => `
Write a ${length} article in a ${tone} tone.
Topic: ${topic}
Use headings, paragraphs, and clear explanation.
`,

    blogTitles: ({ keyword, category }) => `
Generate 10 catchy blog titles.
Category: ${category}
Keyword: ${keyword}
Return as numbered list.
`,

    resume: (text) => `
You are a professional resume reviewer.
Give:
1. Score /10
2. Strengths
3. Weaknesses
4. Improvements

Resume:
${text}
`
};
