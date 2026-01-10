
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Clock, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle,
  Copy,
  ChevronRight,
  Loader2
} from "lucide-react";

const tabs = [
  { id: "ai", label: "AI Topic", icon: Sparkles },
  { id: "pdf", label: "Upload PDF", icon: Upload },
  { id: "manual", label: "Manual", icon: Edit3 },
];

function CreateQuiz() {
  // State
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("ai");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Quiz Data
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState(10); // Default 10 mins
  const [numQuestions, setNumQuestions] = useState(5);
  
  // AI/Upload Inputs
  const [aiPrompt, setAiPrompt] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  // Result Data
  const [quizId, setQuizId] = useState(null);
  const [quizCode, setQuizCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // ---------------- HANDLERS ----------------

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("⚠️ Please enter a quiz title.");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      if (activeTab === "manual") {
        await createManualQuiz();
      } else {
        await createAIQuiz();
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const createManualQuiz = async () => {
    // 1. Create Quiz Entry
    const res = await api.post("/quiz/create/", {
      title,
      timer: timer * 60,
      total_questions: numQuestions,
    });
    
    setQuizId(res.data.quiz_id);
    setQuizCode(res.data.code);
    
    // 2. Initialize Empty Questions
    const qArray = Array.from({ length: numQuestions }, () => ({
      text: "",
      options: ["", "", "", ""],
      correct: 0,
    }));
    setQuestions(qArray);
    setStep(2);
  };

  const createAIQuiz = async () => {
    if (activeTab === "ai" && !aiPrompt.trim()) throw new Error("Please enter a topic.");
    if (activeTab === "pdf" && !pdfFile) throw new Error("Please upload a PDF.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("num_questions", numQuestions);
    formData.append("difficulty", "medium");
    
    if (activeTab === "ai") formData.append("topic", aiPrompt);
    if (activeTab === "pdf") {
      formData.append("topic", "Generated from PDF"); // Value required by backend?
      formData.append("pdf", pdfFile);
    }

    // Call AI Endpoint
    const aiRes = await api.post("/ai/generate-quiz/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const aiQuestions = aiRes.data.result?.questions || [];

    // Create Actual Quiz
    const res = await api.post("/quiz/create/", {
      title,
      timer: timer * 60,
      total_questions: aiQuestions.length,
    });

    setQuizId(res.data.quiz_id);
    setQuizCode(res.data.code);
    
    // Map AI Questions to State
    const formatted = aiQuestions.map((q) => ({
      text: q.question,
      options: q.options,
      correct: q.answer, 
    }));
    
    setQuestions(formatted);
    checkCompletion(formatted);
    setStep(2);
  };

  // ---------------- QUESTION EDITING ----------------

  const handleQuestionChange = (i, field, value) => {
    const updated = [...questions];
    updated[i][field] = value;
    setQuestions(updated);
    checkCompletion(updated);
  };

  const handleOptionChange = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
    checkCompletion(updated);
  };

  const checkCompletion = (updatedQuestions) => {
    const isComplete = updatedQuestions.every(
      (q) => q.text?.trim() && q.options.every((opt) => opt?.trim())
    );
    setIsReady(isComplete);
  };

  const handleSaveQuestions = async () => {
    if (!quizId) return;
    setIsLoading(true);
    try {
        // Backend expects { questions: [...] }
        const payload = questions.map(q => ({
            text: q.text,
            options: q.options,
            correct: parseInt(q.correct), // Ensure integer
        }));

        await api.post(`/quiz/${quizId}/add-questions/`, { questions: payload });
        setStep(3);
    } catch (err) {
        setMessage("❌ Failed to save questions.");
    } finally {
        setIsLoading(false);
    }
  };

  // ---------------- RENDER ----------------

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {step === 1 ? "Create New Quiz" : step === 2 ? "Review & Edit" : "Quiz Ready!"}
            </h1>
            <p className="text-slate-500 mt-2">
              {step === 1 ? "Choose how you want to generate your questions." : step === 2 ? "Make sure everything looks perfect." : "Share the code with your students."}
            </p>
          </div>

          <Card className="p-0 border-0 shadow-xl overflow-visible">
            
            {/* PROGRESS BAR */}
            <div className="bg-slate-100 h-2 w-full rounded-t-2xl overflow-hidden flex">
              <div 
                className={`h-full bg-primary-600 transition-all duration-500 ease-out ${
                  step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
                }`} 
              />
            </div>

            <div className="p-8">
              {message && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
                   {message}
                </div>
              )}

              {/* STEP 1: CONFIGURATION */}
              {step === 1 && (
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input 
                      label="Quiz Title" 
                      placeholder="e.g. Introduction to Physics"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Timer (mins)" 
                        type="number" 
                        min="1"
                        value={timer}
                        onChange={(e) => setTimer(e.target.value)}
                        icon={Clock}
                      />
                      <Input 
                        label="Questions" 
                        type="number" 
                        min="1" 
                        max="50"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 ml-1">Generation Method</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive 
                                ? "bg-white text-primary-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <Icon size={18} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="min-h-[120px]">
                      {activeTab === "ai" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Topic or Prompt</label>
                          <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                            rows="3"
                            placeholder="e.g. key concepts of quantum mechanics, history of rome..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                          />
                        </motion.div>
                      )}
                      
                      {activeTab === "pdf" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Upload PDF Document</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 hover:border-primary-400 transition-all cursor-pointer relative text-center">
                              <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={(e) => setPdfFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="flex flex-col items-center justify-center text-slate-500">
                                <Upload size={32} className="mb-2 text-slate-400" />
                                {pdfFile ? (
                                  <span className="text-primary-600 font-semibold">{pdfFile.name}</span>
                                ) : (
                                  <>
                                    <span className="font-medium text-slate-700">Click to upload</span>
                                    <span className="text-xs">PDF up to 10MB</span>
                                  </>
                                )}
                              </div>
                            </div>
                        </motion.div>
                      )}

                      {activeTab === "manual" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                            <Edit3 size={20} />
                            <p className="text-sm">You will manually type all questions and answers in the next step.</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={handleCreate}
                    isLoading={isLoading}
                  >
                    {activeTab === 'manual' ? 'Create & Add Questions' : 'Generate with AI'}
                    {!isLoading && <ChevronRight className="ml-2" />}
                  </Button>
                </div>
              )}

              {/* STEP 2: EDITING */}
              {step === 2 && (
                <div className="space-y-6">
                  {questions.map((q, qi) => (
                    <motion.div 
                      key={qi}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: qi * 0.05 }}
                      className="p-6 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question {qi + 1}</span>
                      </div>
                      
                      <Input
                        value={q.text}
                        onChange={(e) => handleQuestionChange(qi, 'text', e.target.value)}
                        placeholder="Enter your question text..."
                        className="mb-4 bg-white font-medium"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`relative flex items-center p-3 rounded-lg border transition-all ${
                            q.correct === oi 
                              ? 'bg-green-50 border-green-200 ring-2 ring-green-500/20' 
                              : 'bg-white border-slate-200 focus-within:border-primary-300'
                          }`}>
                            <input
                              type="radio"
                              name={`q-${qi}-correct`}
                              checked={q.correct === oi}
                              onChange={() => handleQuestionChange(qi, 'correct', oi)}
                              className="mr-3 h-5 w-5 text-primary-600 focus:ring-primary-500"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="w-full bg-transparent outline-none text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  <div className="flex items-center gap-4 pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                    <div className="flex-1" />
                    <Button 
                      onClick={handleSaveQuestions} 
                      disabled={!isReady || isLoading}
                      isLoading={isLoading}
                      className="min-w-[150px]"
                    >
                      Save & Publish
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {step === 3 && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Created Successfully!</h2>
                  <p className="text-slate-600 mb-8">Your quiz is ready to be shared.</p>

                  <div className="max-w-xs mx-auto bg-slate-100 p-4 rounded-xl border border-slate-200 mb-8 relative group">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Quiz Code</p>
                    <div className="text-3xl font-mono font-bold tracking-wider text-slate-800 flex items-center justify-center gap-3">
                      {quizCode}
                      <button 
                        onClick={() => navigator.clipboard.writeText(quizCode)} 
                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                        title="Copy Code"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                     <Button 
                       variant="secondary"
                       onClick={() => window.location.href = '/teacher'} 
                     >
                       Go to Dashboard
                     </Button>
                     <Button 
                        onClick={() => {
                          setStep(1);
                          setTitle("");
                          setQuestions([]);
                          setQuizId(null);
                        }}
                     >
                        Create Another
                     </Button>
                  </div>
                </div>
              )}

            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateQuiz;
