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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      prompt = "Summarize the content of this PDF clearly";
    }

    try {
      setLoading(true);
      setSummary("");

      const base64Data = await fileToBase64(file);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
    } catch (err) {
      console.error("Error uploading file:", err);
      setSummary("Error generating summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  //Chat Feature

  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);





  return (
    <main className="app-shell">
      <section className="paper">
        <p className="eyebrow">Saturday Edition</p>
        <h1>Doc Summarizer</h1>
        <p className="subhead">
          Upload a PDF or image and get a quick, readable summary.
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
            accept=".pdf,image/*"
          />

          {file && (
            <p className="file-meta">
              {file.name} | {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}

          {file && previewURL && (
            <div className="preview-wrap" aria-label="File preview">
              <img
                style={{ width:"5rem"}}
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
           
           <div className="chats"></div>
           
           <div className="chat-box">
            <input type="text" placeholder="Ask anything..." onChange={(e) => setCurrentQuestion(e.target.value)} />
            <button type="button" onClick={handleChatSubmit}>
              Send
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
