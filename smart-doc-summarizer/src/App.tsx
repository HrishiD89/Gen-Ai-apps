import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<
    { role: string; parts: { text: string }[] }[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  let fileContext: string = "";

  const fileToBase64 = async (selectedFile: File) => {
    const arrayBuffer = await selectedFile.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        setPreviewURL(URL.createObjectURL(selectedFile));
      } else if (
        selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf")
      ) {
        setPreviewURL("/pdf.png");
      } else {
        setPreviewURL(null);
      }
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    setChatHistory([]);
    setCurrentQuestion("");

    e.preventDefault();

    if (!file) {
      console.log("No files selected!");
      return;
    }

    let prompt = "Summarize this document";

    if (file.type.startsWith("image/")) {
      prompt = "Caption this image clearly.";
    }

    if (file.type === "application/pdf") {
      prompt = "Summarize the content of this PDF clearly.";
    }

    if (
      file.type === "text/plain" ||
      file.name.toLowerCase().endsWith(".txt")
    ) {
      prompt = "Summarize the content of this text file clearly.";
    }

    try {
      setLoading(true);
      setSummary("");

      const base64Data = await fileToBase64(file);

      fileContext =  base64Data;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
        ],
      });

      setSummary(response.text ?? "No summary generated.");

      const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview",
        history: chatHistory,

        config: {
          systemInstruction: `
Greet the user and offer to answer any questions

  `,
        },
      });

      const response2 = await chat.sendMessage({
        message: currentQuestion,
      });

      const modelEntry = {
        role: "model",
        parts: [{ text: response2.text ?? "" }],
      };
      setChatHistory((prev) => [...prev, modelEntry]);
    } catch (err) {
      console.error("Error uploading file:", err);
      setSummary("Error generating summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //Chat Feature

  const handleChatSubmit = async () => {
    if (!currentQuestion.trim()) return;

    const newUserEntry = {
      role: "user",
      parts: [{ text: currentQuestion }],
    };

    setChatHistory((prev) => [...prev, newUserEntry]);

    try {
      setChatLoading(true);

      const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview",
        history: chatHistory,

        config: {
          systemInstruction: `
You are a helpful document assistant. 
Greet the user warmly and invite them to ask questions about their document. 
Use the document context to answer in clear, simple language. 
Keep replies short and conversational, like a human helper. 

${summary}

  `,
        },
      });

      const response1 = await chat.sendMessage({
        message: currentQuestion,
      });

      console.log("Chat response 1:", response1.text);

      const modelEntry = {
        role: "model",
        parts: [{ text: response1.text ?? "" }],
      };
      setChatHistory((prev) => [...prev, modelEntry]);
      setCurrentQuestion("");
    } catch (err) {
      console.error("Error during chat:", err);
      const modelEntry = {
        role: "model",
        parts: [{ text: (err as undefined) ?? "" }],
      };
      setChatHistory((prev) => [...prev, modelEntry]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="paper">
        <p className="eyebrow">Saturday Edition</p>
        <h1>Doc Summarizer</h1>
        <p className="subhead">
          Upload any document or image and get a quick, readable summary.
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <label htmlFor="file" className="file-label">
            Choose file to upload
          </label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleChange}
            accept=".pdf,image/*,.txt"
          />

          {file && (
            <p className="file-meta">
              {file.name} | {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}

          {file && previewURL && (
            <div className="preview-wrap" aria-label="File preview">
              <img
                style={{ width: "5rem" }}
                src={previewURL}
                alt="Preview"
                className="preview-image"
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Summarizing..." : "Submit"}
          </button>
        </form>

        <section className="summary">
          <h2>Summary</h2>
          {loading ? (
            <p className="loader" aria-label="Loading summary"></p>
          ) : (
            <p>{summary || "Your generated summary will appear here."}</p>
          )}
        </section>

        <section className="chat">
          <h2>Chat with your document</h2>
          <p>Ask questions about your document and get answers in real-time.</p>

          <div className="chat-box">
            <div className="chats">
              {chatHistory.map((entry, indx) => {
                return (
                  <div key={indx} className={`chat-entry ${entry.role}`}>
                    {entry.parts.map((part, partIndx) => (
                      <p key={partIndx}>{part.text}</p>
                    ))}
                  </div>
                );
              })}
            </div>
            {chatLoading && (
              <p className="loader2" aria-label="Loading chat response"></p>
            )}
            <div className="chat-input">
              <input
                type="text"
                placeholder="Ask anything..."
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
              />
              <button
                type="button"
                disabled={chatLoading}
                onClick={handleChatSubmit}
              >
                {chatLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
