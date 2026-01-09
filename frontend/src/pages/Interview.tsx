import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Mic, MicOff, Bot, User, Sparkles,
  Play, Volume2, VolumeX, Brain, Target, Upload, FileText, Loader2,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

const domains = [
  { value: "software", label: "Software Engineering" },
  { value: "data", label: "Data Science" },
  { value: "product", label: "Product Management" },
  { value: "design", label: "UI/UX Design" },
  { value: "marketing", label: "Digital Marketing" },
];

const Interview = () => {
  /* ================= AUTH ================= */
  const user = getCurrentUser();
  if (!user?.id) throw new Error("User not authenticated");

  /* ================= CONFIG ================= */
  const [selectedDomain, setSelectedDomain] = useState("software");
  const [interviewMode, setInterviewMode] = useState<"domain" | "resume">("domain");
  const [questionCount, setQuestionCount] = useState(4);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  /* ================= SESSION ================= */
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  /* ================= UI ================= */
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  /* ================= SPEECH ================= */
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (e: any) => {
        let finalText = "";
        let interimText = "";

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          e.results[i].isFinal ? (finalText += t + " ") : (interimText += t);
        }

        setLiveTranscript((p) => (p + finalText + interimText).trim());
      };
    }
  }, []);

  const speakText = (text: string) => {
    if (!isSoundEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  /* ================= START INTERVIEW ================= */
  const startInterview = async () => {
    setIsLoadingQuestions(true);

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("mode", interviewMode);
    formData.append("domain", selectedDomain);
    formData.append("questionCount", String(questionCount));
    if (resumeFile) formData.append("resume", resumeFile);

    const data = await apiFetch("/api/interview/start", {
      method: "POST",
      body: formData,
    });

    setSessionId(data.sessionId);
    setQuestions(data.questions);
    setCurrentQuestionIndex(0);
    setIsInterviewStarted(true);
    setIsLoadingQuestions(false);

    setMessages([{
      id: Date.now().toString(),
      role: "ai",
      content: data.questions[0],
      timestamp: new Date(),
    }]);

    speakText(data.questions[0]);
  };

  /* ================= RECORD ================= */
  const toggleRecording = () => {
    if (!isRecording) {
      setLiveTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
    } else {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (liveTranscript.trim()) submitAnswer(liveTranscript);
    }
  };

  /* ================= SUBMIT ANSWER ================= */
  const submitAnswer = async (answer: string) => {
    setMessages((p) => [
      ...p,
      { id: Date.now().toString(), role: "user", content: answer, timestamp: new Date() },
    ]);

    setLiveTranscript("");
    setIsGeneratingFeedback(true);

    const data = await apiFetch("/api/interview/answer", {
      method: "POST",
      body: {
        userId: user.id,
        sessionId,
        domain: selectedDomain,
        question: questions[currentQuestionIndex],
        answer,
        index: currentQuestionIndex,
      },
    });

    setMessages((p) => [
      ...p,
      {
        id: Date.now().toString(),
        role: "ai",
        content: `Score: ${data.score}/100\n\n${data.feedback}\n\nSuggestions:\n- ${data.suggestions.join("\n- ")}`,
        timestamp: new Date(),
      },
    ]);

    setIsGeneratingFeedback(false);

    if (!data.isLastQuestion && data.askNextQuestion) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      setTimeout(() => {
        setMessages((p) => [
          ...p,
          {
            id: Date.now().toString(),
            role: "ai",
            content: questions[nextIndex],
            timestamp: new Date(),
          },
        ]);
        speakText(questions[nextIndex]);
      }, 800);
    } else {
      setMessages((p) => [
        ...p,
        {
          id: Date.now().toString(),
          role: "ai",
          content: `Interview completed 🎉\nOverall Score: ${data.overallScore ?? "N/A"}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
    });
  }, [messages]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    }
  };
  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar/>
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Interview Practice
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Practice with real-time voice input and AI-powered feedback
            </p>
          </div>

          {!isInterviewStarted ? (
            /* Interview Setup */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Configure Your Interview</h2>
                  <p className="text-slate-400">
                    Customize your practice session for the best experience
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Interview Mode */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300">Interview Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setInterviewMode("domain")}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          interviewMode === "domain"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <Target className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                        <p className="font-semibold mb-1">Domain-Based</p>
                        <p className="text-xs text-slate-400">Practice by industry domain</p>
                      </button>
                      <button
                        onClick={() => setInterviewMode("resume")}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          interviewMode === "resume"
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <FileText className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                        <p className="font-semibold mb-1">Resume-Based</p>
                        <p className="text-xs text-slate-400">Questions from your resume</p>
                      </button>
                    </div>
                  </div>

                  {/* Domain Selection */}
                  {interviewMode === "domain" && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300">Select Domain</label>
                      <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {domains.map((domain) => (
                            <SelectItem key={domain.value} value={domain.value} className="text-white focus:bg-slate-800">
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Resume Upload */}
                  {interviewMode === "resume" && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300">Upload Resume (PDF)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all"
                        >
                          <Upload className="w-6 h-6 text-purple-400" />
                          <span className="text-slate-300">
                            {resumeFile ? resumeFile.name : "Click to upload PDF"}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Question Count */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-300">Number of Questions</label>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {questionCount} Questions
                      </Badge>
                    </div>
                    <Slider
                      value={[questionCount]}
                      onValueChange={(value) => setQuestionCount(value[0])}
                      min={3}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>3 min</span>
                      <span>10 max</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <Mic className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="font-medium">Voice Input</p>
                      <p className="text-slate-400 text-xs">Real-time</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="font-medium">AI Feedback</p>
                      <p className="text-slate-400 text-xs">Instant</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <Volume2 className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                      <p className="font-medium">Audio Output</p>
                      <p className="text-slate-400 text-xs">Text-to-Speech</p>
                    </div>
                  </div>

                  <Button
                    onClick={startInterview}
                    disabled={isLoadingQuestions || (interviewMode === "resume" && !resumeFile)}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
                  >
                    {isLoadingQuestions ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Interview
                      </>
                    )}
                  </Button>
                </div>

                {/* Loading Questions Animation */}
                {isLoadingQuestions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 space-y-4"
                  >
                    <div className="text-center text-slate-400 mb-4">
                      <Sparkles className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                      AI is preparing your questions...
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" style={{ width: '60%' }} />
                        <div className="h-4 bg-slate-800 rounded animate-pulse" style={{ width: '80%' }} />
                      </div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ) : (
            /* Interview Chat */
            <div className="max-w-5xl mx-auto">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Interviewer</p>
                      <p className="text-xs text-slate-400">
                        Question {currentQuestionIndex + 1} of {questionCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live Session
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSound}
                      className="text-slate-400 hover:text-white"
                    >
                      {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  className="h-[500px] overflow-y-auto p-6 space-y-6"
                >
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "ai"
                              ? "bg-gradient-to-br from-blue-500 to-purple-500"
                              : "bg-slate-700"
                          }`}
                        >
                          {message.role === "ai" ? (
                            <Bot className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 ${
                            message.role === "ai"
                              ? "bg-slate-800/50 border border-slate-700"
                              : "bg-blue-500/20 border border-blue-500/30"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Feedback Loading Animation */}
                  {isGeneratingFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            Reviewing your answer
                          </motion.span>
                          <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            ...
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Recording Interface */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/30">
                  {/* Live Transcript */}
                  {liveTranscript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <p className="text-xs text-slate-400 mb-2">Live Transcript:</p>
                      <p className="text-sm text-slate-200">{liveTranscript}</p>
                    </motion.div>
                  )}

                  {/* Recording Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={toggleRecording}
                      disabled={isGeneratingFeedback}
                      className={`h-16 w-16 rounded-full transition-all ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-slate-400 mt-4">
                    {isRecording ? "Click to stop recording and submit" : "Click to start recording your answer"}
                  </p>

                  {/* Recording Animation */}
                  {isRecording && (
                    <motion.div className="flex justify-center gap-1 mt-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-blue-500 rounded-full"
                          animate={{
                            height: ["8px", "24px", "8px"],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default Interview;