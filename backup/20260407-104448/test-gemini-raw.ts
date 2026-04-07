async function getModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const res = await fetch(url);
    const json = await res.json();
    console.log("Available Models:", json.models.map((m: any) => m.name).join("\n"));
}
getModels();
