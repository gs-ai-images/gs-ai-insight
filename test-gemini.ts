import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
    console.log("Calling Gemini 3.1...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const prompt = `You are a professional AI News Editor. Summarize the following news article into a high-quality Markdown format for an AI Portal. 
        Source: AITimes
        Write in **Korean**.
        
        Please return your response EXACTLY in this JSON format without any markdown code block syntax (like \`\`\`json):
        {
          "title": "A catchy, concise title highlighting the core trend",
          "summary": "3 bullet points summarizing the core news, separated by newline",
          "content": "Detailed markdown contents with nice headings",
          "tags": "AI,Trend,Business"
        }

        Text to summarize:
        test body text
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        console.log("Raw Response:");
        console.log(responseText);
    } catch(e: any) {
        console.error("Gemini Error:", e.status, e.statusText);
        console.error(e);
    }
}

test();
