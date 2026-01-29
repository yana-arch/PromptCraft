<div align="center">
  <h1>✨ PromptCraft</h1>
  <p><strong>Visually build, test, and refine your AI prompts.</strong></p>
  <p>A powerful tool to craft perfect prompts for LLMs using goal-based wizards or advanced professional controls.</p>
</div>

---

## 🚀 Features

### 🔹 Basic Mode (Wizard Style)
Perfect for beginners or quick tasks.
- **Goal Selection:** Choose from Marketing, Programming, Creative Writing, and Academic goals.
- **Guided Input:** Fill in structured forms (Product, Audience, Tone) to generate effective prompts.
- **Auto-Optimization:** Built-in "Improve with AI" to refine your prompt automatically.

### ⚡ Advanced Mode (Professional)
For prompt engineers and power users.
- **🧠 Persona Builder:** Configure specific AI personas with roles, expertise, and communication styles.
- **📝 Template Library:** Use and customize templates like Chain-of-Thought (CoT), Few-Shot, and more.
- **⚙️ Model Tuning:** Select target models (GPT-4, Claude 3, Gemini) and tune parameters (Temperature, Max Tokens).
- **🛠️ Technique Selector:** Toggle advanced techniques like Self-Consistency and Tree of Thoughts.

### 🎨 Modern UI/UX
- **Dual Theme:** Fully synchronized Light (Slate) and Dark (Midnight) modes.
- **Responsive Design:** Works seamlessly on desktop and mobile.
- **Real-time Preview:** See your prompt structure update as you build.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **AI Integration:** Google Generative AI SDK (Gemini)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PromptCraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Visit `http://localhost:5173` to start crafting prompts!

---

## 📂 Project Structure

```
src/
├── components/         # UI Components
│   ├── advanced/       # Advanced Mode components (Persona, Model, etc.)
│   ├── sidebar/        # Sidebar and history management
│   └── ...             # Basic mode wizard steps
├── hooks/              # Custom React hooks (useAiApi, useAppState)
├── lib/                # Utilities and AI service logic
├── constants.tsx       # App data (Categories, Templates, Models)
├── types.ts            # TypeScript definitions
└── translations.ts     # i18n support (English/Vietnamese)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  Built with ❤️ by AI & Human Collaboration
</div>
