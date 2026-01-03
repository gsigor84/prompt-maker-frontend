"use client";

import { useState } from 'react';
import ModeSelector from '@/components/ModeSelector';
import { runAgentPipeline } from '@/lib/agentApi';

export default function StudioPage() {
    const [mode, setMode] = useState('fast');
    const [task, setTask] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);

    // Interactive State
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    const handleGenerate = async (providedAnswers = null) => {
        if (!task.trim()) return;

        setIsGenerating(true);
        if (!providedAnswers) {
            setResult(null);
            setLogs([]);
            setQuestions([]);
        }

        try {
            const data = await runAgentPipeline(
                task,
                'gpt-4o-mini',
                mode === 'interactive',
                providedAnswers
            );

            if (data.execution_trace) setLogs(prev => [...prev, ...data.execution_trace]);

            if (data.status === 'needs_info' && data.questions) {
                setQuestions(data.questions);
                const initialAnswers = {};
                data.questions.forEach(q => initialAnswers[q] = "");
                setAnswers(initialAnswers);
            } else {
                setQuestions([]);
                setResult(data);
            }

        } catch (error) {
            console.error(error);
            setLogs(prev => [...prev, { step_name: 'Error', status: 'failed', output: error.message }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const submitAnswers = () => handleGenerate(answers);

    return (
        <div className="min-h-screen bg-[#F2F2F2] text-[#0D0D0D] font-sans selection:bg-[#D9CBBA] selection:text-[#0D0D0D]">

            {/* Main Content Container */}
            <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-[140px] pb-32">

                {/* Header Section */}
                <header className="text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-[36px] md:text-[48px] font-serif font-light leading-snug tracking-normal mb-8 text-[#0D0D0D]">
                        Constructing Intelligence.
                    </h1>
                    <div className="w-16 h-0.5 bg-[#D9CBBA] mx-auto mb-8"></div>
                    <p className="text-[14px] uppercase tracking-[0.25em] text-[#59514D] font-medium max-w-2xl mx-auto">
                        A fluid interface for designing system prompts.
                    </p>
                </header>

                {/* Mode & Input Section */}
                {questions.length === 0 && (
                    <div className="animate-in fade-in duration-700 delay-150 flex flex-col items-center w-full">
                        {/* Mode Selector */}
                        <ModeSelector selected={mode} onSelect={setMode} />

                        {/* Input Card */}
                        <div className="w-full bg-white rounded-[40px] shadow-sm p-12 md:p-16 relative group transition-all hover:shadow-lg border border-transparent hover:border-[#D9CBBA]/30">
                            <label className="block text-[24px] font-serif font-light mb-8 text-[#0D0D0D]">
                                {mode === 'interactive' ? "Start your vision." : "Define the task."}
                            </label>
                            <textarea
                                className="w-full min-h-[240px] text-[20px] leading-[1.8] text-[#0D0D0D] font-light placeholder-[#8C8480] bg-transparent outline-none resize-none"
                                placeholder={mode === 'interactive' ? "Describe your goal vaguely..." : "E.g. Create a python script..."}
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                            />

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => handleGenerate(null)}
                                    disabled={isGenerating || !task.trim()}
                                    className={`
                                rounded-full px-[40px] py-[16px] text-[14px] uppercase tracking-[0.15em] font-medium transition-all duration-300 transform
                                ${isGenerating || !task.trim()
                                            ? 'bg-[#E5E5E5] text-[#8C8480] cursor-not-allowed'
                                            : 'bg-[#0D0D0D] text-[#D9CBBA] hover:bg-[#59514D] hover:text-white shadow-xl hover:-translate-y-1'
                                        }
                            `}
                                >
                                    {isGenerating ? 'Processing...' : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Questionnaire Mode */}
                {questions.length > 0 && (
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-[#59514D]/10 p-12 md:p-16 w-full animate-in zoom-in-95 duration-500">
                        <h3 className="text-[32px] font-serif font-light leading-[1.1] mb-2 text-[#0D0D0D]">We need details.</h3>
                        <p className="text-[18px] text-[#59514D] font-light mb-12">Help the system understand your exact constraints.</p>

                        <div className="space-y-12">
                            {questions.slice(0, 10).map((q, idx) => (
                                <div key={idx} className="group">
                                    <label className="block text-[18px] font-serif font-normal text-[#0D0D0D] mb-4 group-hover:text-[#59514D] transition-colors">
                                        {q}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full text-[18px] py-3 border-b border-[#E5E5E5] focus:border-[#D9CBBA] outline-none bg-transparent transition-colors placeholder-[#8C8480]/50 text-[#59514D] font-light"
                                        placeholder="Tap to answer..."
                                        value={answers[q] || ''}
                                        onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 flex justify-end gap-8 items-center">
                            <button
                                onClick={() => setQuestions([])}
                                className="text-[14px] uppercase tracking-[0.1em] text-[#8C8480] hover:text-[#0D0D0D] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitAnswers}
                                className="rounded-full px-[48px] py-[16px] bg-[#0D0D0D] text-[#D9CBBA] text-[14px] uppercase tracking-[0.15em] font-medium hover:bg-[#59514D] hover:text-white transition-all shadow-lg"
                            >
                                Review & Submit
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {(isGenerating || result || logs.length > 0) && (
                    <div className="mt-32 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* Trace Log */}
                        <div className="mb-16 pl-6 border-l border-[#D9CBBA]">
                            <h4 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#8C8480] mb-6">Orchestration Trace</h4>
                            <div className="space-y-4">
                                {logs.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-4 text-[15px] font-mono">
                                        <span className={`w-2 h-2 rounded-full ${step.status === 'failed' ? 'bg-[#59514D]' : 'bg-[#D9CBBA]'}`} />
                                        <span className="text-[#0D0D0D] font-medium">{step.step_name}</span>
                                        <span className="text-[#59514D] truncate">{step.output}</span>
                                    </div>
                                ))}
                                {isGenerating && <div className="text-[#D9CBBA] text-[15px] animate-pulse">Thinking...</div>}
                            </div>
                        </div>

                        {/* Final Prompt Card */}
                        {result?.final_prompt && (
                            <div className="relative overflow-hidden rounded-[32px] bg-[#FFFFFF] shadow-2xl ring-1 ring-[#D9CBBA]">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#D9CBBA]"></div>

                                <div className="p-10 pb-0 flex justify-between items-baseline">
                                    <h3 className="text-[28px] font-serif font-light text-[#0D0D0D]">System Prompt</h3>
                                    <div className="flex gap-4 items-center">
                                        {result.critique_score && (
                                            <span className="text-[14px] font-medium text-[#59514D] bg-[#F2F2F2] px-4 py-2 rounded-full border border-[#D9CBBA]">
                                                {result.critique_score}/10
                                            </span>
                                        )}
                                        <button
                                            onClick={() => navigator.clipboard.writeText(result.final_prompt)}
                                            className="text-[13px] font-medium text-[#D9CBBA] hover:text-[#0D0D0D] transition-colors uppercase tracking-[0.15em]"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div className="p-10">
                                    <div className="prose prose-xl max-w-none text-[#0D0D0D] font-mono text-[16px] leading-loose whitespace-pre-wrap">
                                        {result.final_prompt}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
