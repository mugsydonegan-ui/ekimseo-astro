import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  options?: string[];
  isInput?: 'name' | 'email' | 'url';
}

interface LeadData {
  petType: string;
  hasShopify: string;
  blogStatus: string;
  goal: string;
  name: string;
  email: string;
  storeUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Qualification flow                                                 */
/* ------------------------------------------------------------------ */

const STEPS: {
  key: keyof LeadData;
  botMessage: string;
  options?: string[];
  isInput?: 'name' | 'email' | 'url';
}[] = [
  {
    key: 'petType',
    botMessage: 'What type of pet brand do you run?',
    options: ['Dog', 'Cat', 'Small Animal', 'Reptile', 'Equine', 'Multiple'],
  },
  {
    key: 'hasShopify',
    botMessage: 'Are you on Shopify?',
    options: ['Yes', 'No, but planning to', 'No'],
  },
  {
    key: 'blogStatus',
    botMessage: "How's your blog looking right now?",
    options: [
      'No blog yet',
      "Have one — hasn't been updated",
      'Publishing but not ranking',
      'Publishing and ranking well',
    ],
  },
  {
    key: 'goal',
    botMessage: "What's your main goal?",
    options: [
      'More organic traffic',
      'Outrank competitors',
      'Build brand authority',
      'All of the above',
    ],
  },
  {
    key: 'name',
    botMessage: "Great — sounds like we can help. What's your name?",
    isInput: 'name',
  },
  {
    key: 'email',
    botMessage: 'And your best email?',
    isInput: 'email',
  },
  {
    key: 'storeUrl',
    botMessage: 'Last one — drop your store URL so Mike can pull it up during the audit.',
    isInput: 'url',
  },
];

function recommendPlan(data: LeadData): string {
  if (data.blogStatus === 'Publishing and ranking well') {
    return "It sounds like you're already in good shape. The **Authority plan** ($1,497/mo — 10 articles) would help you dominate your niche and lock competitors out.";
  }
  if (
    data.blogStatus === 'Publishing but not ranking' ||
    data.goal === 'Outrank competitors' ||
    data.goal === 'All of the above'
  ) {
    return "Based on what you've told me, the **Growth plan** ($797/mo — 5 articles) is probably the sweet spot. Enough volume to build momentum without the full commitment.";
  }
  return "For getting started, the **Starter plan** ($497/mo — 3 articles) is a great fit. It lets you test the process and see results before scaling up.";
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-[#8a8678] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function BotBubble({ text }: { text: string }) {
  const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] self-start"
    >
      <div
        className="bg-[#1a3a2a] text-[#f5f0e8] text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-bl-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </motion.div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] self-end"
    >
      <div className="bg-[#c9973a] text-[#1a3a2a] text-sm font-medium leading-relaxed px-4 py-3 rounded-2xl rounded-br-sm">
        {text}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main ChatBot component                                             */
/* ------------------------------------------------------------------ */

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [leadData, setLeadData] = useState<LeadData>({
    petType: '',
    hasShopify: '',
    blogStatus: '',
    goal: '',
    name: '',
    email: '',
    storeUrl: '',
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const id = () => nextId.current++;

  /* auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* focus input when step changes */
  useEffect(() => {
    if (currentStep >= 0 && STEPS[currentStep]?.isInput) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [currentStep]);

  /* kick off conversation when opened */
  function startChat() {
    if (hasStarted) return;
    setHasStarted(true);
    setIsTyping(true);

    setTimeout(() => {
      setMessages([
        {
          id: id(),
          from: 'bot',
          text: "Hey! I'm the EkimSEO assistant. I can help figure out if our SEO content service is a fit for your pet brand. Mind if I ask a few quick questions?",
          options: ['Sure, let\u2019s go!', 'Tell me more first'],
        },
      ]);
      setIsTyping(false);
    }, 800);
  }

  function handleOpen() {
    setIsOpen(true);
    startChat();
  }

  /* add a bot message with a typing delay */
  function addBotMessage(msg: Omit<Message, 'id' | 'from'>, delay = 600) {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { ...msg, id: id(), from: 'bot' }]);
      setIsTyping(false);
    }, delay);
  }

  /* handle option click or intro */
  function handleOption(text: string) {
    setMessages((prev) => [...prev, { id: id(), from: 'user', text }]);

    /* special: intro response */
    if (currentStep === -1) {
      if (text === 'Tell me more first') {
        addBotMessage({
          text: 'We write SEO-optimized blog content exclusively for Shopify pet brands. Our clients see an average +312% organic traffic growth in 6 months. Want to see if it\u2019s a fit?',
          options: ['Sure, let\u2019s go!'],
        });
        return;
      }
      /* "Sure, let's go!" */
      advanceStep(0);
      return;
    }

    /* save answer */
    const step = STEPS[currentStep];
    setLeadData((prev) => ({ ...prev, [step.key]: text }));
    advanceStep(currentStep + 1, { ...leadData, [step.key]: text });
  }

  /* advance to next step */
  function advanceStep(nextStep: number, data?: LeadData) {
    if (nextStep >= STEPS.length) {
      /* done — show recommendation + thank you */
      const finalData = data ?? leadData;
      const rec = recommendPlan(finalData);
      addBotMessage({ text: rec }, 700);

      setTimeout(() => {
        addBotMessage(
          {
            text: "Thanks! Mike will send you a free content audit within 24 hours. Keep an eye on your inbox.",
          },
          1400,
        );
        setIsComplete(true);
        submitLead(finalData);
      }, 100);

      setCurrentStep(nextStep);
      return;
    }

    setCurrentStep(nextStep);
    const step = STEPS[nextStep];
    addBotMessage({
      text: step.botMessage,
      options: step.options,
      isInput: step.isInput,
    });
  }

  /* handle text input submit */
  function handleInputSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    const step = STEPS[currentStep];

    /* basic email validation */
    if (step.isInput === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      addBotMessage({ text: "Hmm, that doesn't look like a valid email. Could you try again?" });
      return;
    }

    setMessages((prev) => [...prev, { id: id(), from: 'user', text: val }]);
    setInputValue('');
    setLeadData((prev) => ({ ...prev, [step.key]: val }));
    advanceStep(currentStep + 1, { ...leadData, [step.key]: val });
  }

  /* submit lead data via mailto fallback */
  function submitLead(data: LeadData) {
    const subject = encodeURIComponent('New Lead from EkimSEO Chatbot');
    const body = encodeURIComponent(
      `New lead from the EkimSEO website chatbot:\n\n` +
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Store URL: ${data.storeUrl}\n\n` +
        `--- Qualification ---\n` +
        `Pet type: ${data.petType}\n` +
        `On Shopify: ${data.hasShopify}\n` +
        `Blog status: ${data.blogStatus}\n` +
        `Main goal: ${data.goal}\n`,
    );

    /* create a hidden link and "click" it to open default mail client */
    const a = document.createElement('a');
    a.href = `mailto:mike@ekimseo.com?subject=${subject}&body=${body}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* current step info */
  const activeStep = currentStep >= 0 && currentStep < STEPS.length ? STEPS[currentStep] : null;
  const showOptions =
    !isComplete &&
    !isTyping &&
    messages.length > 0 &&
    messages[messages.length - 1].from === 'bot' &&
    messages[messages.length - 1].options;
  const showInput =
    !isComplete && !isTyping && activeStep?.isInput && messages[messages.length - 1]?.from === 'bot';

  const inputPlaceholder =
    activeStep?.isInput === 'name'
      ? 'Your name'
      : activeStep?.isInput === 'email'
        ? 'you@example.com'
        : 'https://yourstore.com';

  return (
    <>
      {/* ---- Floating trigger button ---- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-[#c9973a] hover:bg-[#e0b45a] text-[#1a3a2a] rounded-full shadow-xl flex items-center justify-center transition-colors duration-200 cursor-pointer"
            aria-label="Open chat"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---- Chat panel ---- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-[60] w-[370px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100dvh-3rem)] bg-[#f5f0e8] rounded-2xl shadow-2xl border border-[#1a3a2a]/10 flex flex-col overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#1a3a2a] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#c9973a] rounded-full flex items-center justify-center">
                  <span className="text-[#1a3a2a] text-xs font-black">E</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f5f0e8] leading-tight">EkimSEO</p>
                  <p className="text-xs text-[#b8b2a4]">Usually replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#b8b2a4] hover:text-[#f5f0e8] transition-colors p-1"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg) =>
                msg.from === 'bot' ? (
                  <BotBubble key={msg.id} text={msg.text} />
                ) : (
                  <UserBubble key={msg.id} text={msg.text} />
                ),
              )}
              {isTyping && <TypingIndicator />}

              {/* option buttons */}
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mt-1"
                >
                  {(messages[messages.length - 1].options ?? []).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOption(opt)}
                      className="text-sm font-medium px-4 py-2 rounded-full border border-[#1a3a2a]/20 text-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-[#f5f0e8] active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* completion CTA */}
              {isComplete && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 self-start"
                >
                  <a
                    href="mailto:mike@ekimseo.com?subject=Free Content Audit Request"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-[#c9973a] text-[#1a3a2a] hover:bg-[#e0b45a] active:scale-95 transition-all duration-200"
                  >
                    Email Mike directly
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </motion.div>
              )}
            </div>

            {/* text input */}
            {showInput && (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleInputSubmit}
                className="shrink-0 border-t border-[#1a3a2a]/10 px-4 py-3 flex gap-2"
              >
                <input
                  ref={inputRef}
                  type={activeStep?.isInput === 'email' ? 'email' : 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="flex-1 text-sm bg-white/60 border border-[#1a3a2a]/15 rounded-full px-4 py-2.5 text-[#1a1a18] placeholder:text-[#8a8678] focus:outline-none focus:border-[#c9973a] transition-colors"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-[#1a3a2a] text-[#f5f0e8] flex items-center justify-center hover:bg-[#c9973a] transition-colors shrink-0 cursor-pointer"
                  aria-label="Send"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-7-7l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
