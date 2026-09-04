const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Check, Info, AlertTriangle, ExternalLink, Zap, Share, Map, Lightbulb } from 'lucide-react';",
  "import { Check, Info, AlertTriangle, ExternalLink, Zap, Share, Map, Lightbulb, MessageSquare, Send } from 'lucide-react';"
);

// State additions
code = code.replace(
  "const [error, setError] = useState<string | null>(null);",
  `const [error, setError] = useState<string | null>(null);\n  const [chatInput, setChatInput] = useState("");\n  const [chatMessages, setChatMessages] = useState<{role: 'user'|'assistant', text: string}[]>([]);\n  const [chatLoading, setChatLoading] = useState(false);\n  const [currentInput, setCurrentInput] = useState<any>(state);`
);

// Update fetch analysis to use currentInput instead of state directly, no wait, first load uses state.
code = code.replace(
  "body: JSON.stringify(state)",
  "body: JSON.stringify(currentInput)"
);

// Chat Handle function
const chatFunc = `
  const handleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/analyze/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } : {})
        },
        body: JSON.stringify({
          previousInput: currentInput,
          previousResult: result,
          message: userMsg
        })
      });

      const data = await response.json();
      
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      
      if (data.updatedResult && data.updatedInput) {
        setResult(data.updatedResult);
        setCurrentInput(data.updatedInput);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "خطا در ارتباط با سرور." }]);
    } finally {
      setChatLoading(false);
    }
  };
`;

code = code.replace(
  "  if (loading) {",
  chatFunc + "\n  if (loading) {"
);

// Add UI
const chatUI = `
          {/* Chat Box */}
          <div className="bg-white dark:bg-[#1a1b1e] rounded-xl border border-zinc-200/50 dark:border-zinc-800 p-4 lg:p-6 mt-6 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-blue-500" />
              می‌خواهید سناریوی دیگری را امتحان کنید؟ بپرسید
            </h3>
            
            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                  <div className={\`max-w-[85%] rounded-xl p-3 text-sm \${msg.role === 'user' ? 'bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200'}\`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 text-sm text-zinc-500">
                    در حال پردازش...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleFollowup} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="مثلاً: اگه یه کولر گازی دیگه اضافه کنم چی می‌شه؟"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-blue-500 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
`;

// Insert UI above AdBanner or at the end of content area
code = code.replace(
  "<AdBanner placement=\"result_bottom\" />",
  chatUI + "\n          <AdBanner placement=\"result_bottom\" />"
);

fs.writeFileSync('src/pages/Result.tsx', code);
