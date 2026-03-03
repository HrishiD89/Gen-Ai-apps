import { GoogleGenAI } from "@google/genai";

import { GEMINI_API_KEY } from "./env.js";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const response = await ai.models
  .generateContent({
    model: "gemini-2.5-flash",
    contents: `
    Write an interesting science fact in 3 lines or less.
Choose randomly between one of the following topics:
- Music
- Astrophysics
- Biology  

Add some emojis to make it more fun!

dont send markdown, just the text.
    `,
  })
  .then((response) => {
    document.getElementById("response").innerText = response.text;
    document.body.classList.remove("loading");
  })
  .catch((error) => {
    console.error("Error generating content:", error);
  });
