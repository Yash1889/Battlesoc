"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Trophy, Flame, AlertCircle, Trash2 } from "lucide-react";
import { parseResume, ParsedResume } from "@/lib/resume-parser";
import { compareResumes, ResumeComparison } from "@/lib/resume-scorer";

export default function ResumeBattlePage() {
    const [name1, setName1] = useState("");
    const [name2, setName2] = useState("");
    const [resume1, setResume1] = useState<ParsedResume | null>(null);
    const [resume2, setResume2] = useState<ParsedResume | null>(null);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [comparison, setComparison] = useState<ResumeComparison | null>(null);
    const [aiRoast, setAiRoast] = useState<{ roast: string; advice: string } | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    };

    const handleFileUpload = async (file: File, player: 1 | 2) => {
        const setLoading = player === 1 ? setLoading1 : setLoading2;
        const setResume = player === 1 ? setResume1 : setResume2;

        setLoading(true);
        try {
            const text = await extractTextFromPDF(file);
            const parsed = parseResume(text);
            setResume(parsed);
        } catch (error) {
            console.error('PDF extraction error:', error);
            alert('Failed to extract text from PDF. Please try a different file or paste text manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleTextInput = (text: string, player: 1 | 2) => {
        const setResume = player === 1 ? setResume1 : setResume2;
        const parsed = parseResume(text);
        setResume(parsed);
    };

    const handleBattle = async () => {
        if (!resume1 || !resume2) return;

        const result = compareResumes(resume1, resume2);
        setComparison(result);

        setAiLoading(true);
        try {
            const res = await fetch("/api/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    p1: resume1.rawText.substring(0, 2000),
                    p2: resume2.rawText.substring(0, 2000),
                    name1: name1 || "Player 1",
                    name2: name2 || "Player 2",
                    mode: "resume",
                    scores: {
                        p1: result.p1Scores,
                        p2: result.p2Scores
                    },
                    secret: localStorage.getItem("dracula_mode")
                }),
            });
            const data = await res.json();
            setAiRoast({ roast: data.roast, advice: data.advice });
        } catch (error) {
            console.error('AI Roast error:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const resetBattle = () => {
        setComparison(null);
        setAiRoast(null);
        setResume1(null);
        setResume2(null);
        setName1("");
        setName2("");
    };

    return (
        <div className="min-h-screen py-12 flex flex-col items-center gap-8 px-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600">
                    Resume Battle Arena
                </h1>
                <p className="text-muted-foreground">Upload PDFs or paste text. We'll analyze experience, projects, skills, ATS score, and more.</p>
            </div>

            <AnimatePresence mode="wait">
                {!comparison ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <ResumeUploader
                            player={1}
                            name={name1}
                            setName={setName1}
                            onFileUpload={(f) => handleFileUpload(f, 1)}
                            onTextInput={(t) => handleTextInput(t, 1)}
                            loading={loading1}
                            hasResume={!!resume1}
                            onClear={() => setResume1(null)}
                        />

                        <ResumeUploader
                            player={2}
                            name={name2}
                            setName={setName2}
                            onFileUpload={(f) => handleFileUpload(f, 2)}
                            onTextInput={(t) => handleTextInput(t, 2)}
                            loading={loading2}
                            hasResume={!!resume2}
                            onClear={() => setResume2(null)}
                        />

                        <div className="md:col-span-2 flex justify-center">
                            <Button
                                onClick={handleBattle}
                                disabled={!resume1 || !resume2}
                                size="lg"
                                className="w-full max-w-md bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500"
                            >
                                Start Battle
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-6xl space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="inline-block"
                            >
                                <Trophy className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                            </motion.div>
                            <h2 className="text-5xl font-black text-white tracking-tight">
                                {comparison.winner === 'p1' ? (name1 || "Player 1") : (name2 || "Player 2")}{" "}
                                <span className="text-yellow-500">Wins!</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">The superior resume.</p>
                            <div className="flex justify-center gap-8 mt-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">{comparison.p1Scores.total}</div>
                                    <div className="text-sm text-muted-foreground">Total Score</div>
                                    <div className="text-xs text-green-400">ATS: {comparison.p1Scores.ats}</div>
                                </div>
                                <div className="text-6xl text-muted-foreground">vs</div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">{comparison.p2Scores.total}</div>
                                    <div className="text-sm text-muted-foreground">Total Score</div>
                                    <div className="text-xs text-green-400">ATS: {comparison.p2Scores.ats}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-center mb-8">Detailed Breakdown</h3>
                            <div className="grid gap-6">
                                {comparison.breakdown.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-lg">{item.metric}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.winner === 'p1' ? (name1 || "P1") : (name2 || "P2")} wins
                                            </span>
                                        </div>

                                        <div className="relative h-8 bg-black/40 rounded-full overflow-hidden flex mb-2">
                                            <div
                                                className="h-full bg-green-500 flex items-center justify-start px-3 text-xs font-bold text-white transition-all duration-1000"
                                                style={{ width: `${(item.p1Value / (item.p1Value + item.p2Value)) * 100}%` }}
                                            >
                                                {name1 || "P1"}: {item.p1Value}
                                            </div>

                                            <div
                                                className="h-full bg-teal-500 flex items-center justify-end px-3 text-xs font-bold text-white transition-all duration-1000"
                                                style={{ width: `${(item.p2Value / (item.p1Value + item.p2Value)) * 100}%` }}
                                            >
                                                {name2 || "P2"}: {item.p2Value}
                                            </div>
                                        </div>

                                        {item.reason && (
                                            <div className="text-xs text-white/60 mt-2 pl-2 border-l-2 border-white/10">
                                                <span className="font-semibold text-white/80">Why: </span>
                                                {item.reason}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {aiRoast && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="p-8 glass-card border-red-500/30 bg-black/40 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                                    <div className="flex items-center gap-3 mb-4">
                                        <Flame className="w-6 h-6 text-red-500" />
                                        <h3 className="text-xl font-bold text-red-400">The Roast</h3>
                                    </div>
                                    <p className="text-lg text-white/90 italic leading-relaxed">"{aiRoast.roast}"</p>
                                </Card>

                                <Card className="p-8 glass-card border-green-500/30 bg-black/40 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertCircle className="w-6 h-6 text-green-500" />
                                        <h3 className="text-xl font-bold text-green-400">Expert Advice</h3>
                                    </div>
                                    <p className="text-lg text-white/90 leading-relaxed">{aiRoast.advice}</p>
                                </Card>
                            </div>
                        )}

                        {aiLoading && (
                            <div className="text-center text-muted-foreground">
                                <p>Generating AI analysis...</p>
                            </div>
                        )}

                        <div className="flex justify-center pt-8">
                            <Button onClick={resetBattle} variant="outline" size="lg">
                                New Battle
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ResumeUploader({
    player,
    name,
    setName,
    onFileUpload,
    onTextInput,
    loading,
    hasResume,
    onClear
}: {
    player: 1 | 2;
    name: string;
    setName: (name: string) => void;
    onFileUpload: (file: File) => void;
    onTextInput: (text: string) => void;
    loading: boolean;
    hasResume: boolean;
    onClear: () => void;
}) {
    const [mode, setMode] = useState<'upload' | 'paste'>('upload');
    const [pasteText, setPasteText] = useState("");

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            onFileUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handlePasteSubmit = () => {
        if (pasteText.trim()) {
            onTextInput(pasteText);
        }
    };

    return (
        <Card className={`p-6 glass-card space-y-4 ${player === 1 ? 'border-green-500/20' : 'border-teal-500/20'}`}>
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Player {player}</h3>
                {hasResume && (
                    <Button variant="ghost" size="icon" onClick={onClear}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                )}
            </div>

            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary/50 transition-colors"
            />

            <div className="flex gap-2">
                <Button
                    variant={mode === 'upload' ? undefined : 'outline'}
                    size="sm"
                    onClick={() => setMode('upload')}
                    className="flex-1"
                >
                    Upload PDF
                </Button>
                <Button
                    variant={mode === 'paste' ? undefined : 'outline'}
                    size="sm"
                    onClick={() => setMode('paste')}
                    className="flex-1"
                >
                    Paste Text
                </Button>
            </div>

            {mode === 'upload' ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id={`file-${player}`}
                    />
                    <label htmlFor={`file-${player}`} className="cursor-pointer">
                        {loading ? (
                            <div className="text-muted-foreground">Extracting text...</div>
                        ) : hasResume ? (
                            <div className="text-green-400">✓ Resume loaded</div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Drop PDF here or click to upload
                                </p>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="space-y-2">
                    <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder="Paste your resume text here..."
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <Button
                        onClick={handlePasteSubmit}
                        disabled={!pasteText.trim()}
                        className="w-full"
                        size="sm"
                    >
                        {hasResume ? "Update Resume" : "Load Resume"}
                    </Button>
                </div>
            )}

            {hasResume && (
                <div className="text-xs text-green-400 text-center">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Resume ready for battle
                </div>
            )}
        </Card>
    );
}
