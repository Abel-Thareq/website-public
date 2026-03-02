"use client";
import { useEffect, useState, useCallback } from "react";
import NavigationBar from "../components/navigationBar";
import { useUser } from "../providers/userProvider";
import { useTheme } from "../providers/temaProvider";
import { useRouter } from "next/navigation";
import { spkApi, usersApi, teamApi } from "../../lib/api";

interface Theme {
    isDayTime: boolean;
    backgroundImage: string;
    theme: "light" | "dark";
}

// Criteria labels
const CRITERIA = {
    c1: "Presensi Aktual",
    c2: "Kualitas Kerja",
    c3: "Keterlambatan Tugas",
};

const SCALE_VALUES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SpkPage() {
    const { currentUser, loading } = useUser();
    const { theme: themeFromProvider } = useTheme();
    const router = useRouter();

    const [theme, setTheme] = useState<Theme>({
        isDayTime: true,
        backgroundImage: "/backgroundDay.jpg",
        theme: "light",
    });

    // Tab state
    type TabId = "questionnaire" | "optimal" | "scoring" | "results";
    const [activeTab, setActiveTab] = useState<TabId>("questionnaire");
    const [period, setPeriod] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    // AHP state
    const [comparisons, setComparisons] = useState([
        { criteria_i: "c1", criteria_j: "c2", value: 1, side: "equal" as "left" | "right" | "equal", intensity: 1 },
        { criteria_i: "c1", criteria_j: "c3", value: 1, side: "equal" as "left" | "right" | "equal", intensity: 1 },
        { criteria_i: "c2", criteria_j: "c3", value: 1, side: "equal" as "left" | "right" | "equal", intensity: 1 },
    ]);
    const [ahpResult, setAhpResult] = useState<any>(null);
    const [ahpLoading, setAhpLoading] = useState(false);
    const [ahpError, setAhpError] = useState("");

    // Optimal values state
    const [optimalPm, setOptimalPm] = useState({ c1_optimal: 100, c2_optimal: 100, c3_optimal: 0 });
    const [optimalEmployee, setOptimalEmployee] = useState({ c1_optimal: 100, c2_optimal: 100, c3_optimal: 0 });
    const [optimalLoading, setOptimalLoading] = useState(false);
    const [optimalMessage, setOptimalMessage] = useState("");

    // Work quality scoring state
    const [subordinates, setSubordinates] = useState<any[]>([]);
    const [qualityScores, setQualityScores] = useState<Record<number, { score: number; notes: string }>>({});
    const [existingScores, setExistingScores] = useState<any[]>([]);
    const [scoringLoading, setScoringLoading] = useState(false);
    const [scoringMessage, setScoringMessage] = useState("");

    // Results state
    const [results, setResults] = useState<any[]>([]);
    const [resultsRole, setResultsRole] = useState<"pm" | "employee">("employee");
    const [resultsLoading, setResultsLoading] = useState(false);
    const [calcLoading, setCalcLoading] = useState(false);
    const [calcMessage, setCalcMessage] = useState("");

    // Theme sync
    useEffect(() => {
        const loadTheme = () => {
            const savedTheme = localStorage.getItem("selectedTheme");
            if (savedTheme) {
                try {
                    const parsed = JSON.parse(savedTheme);
                    setTheme(prev => {
                        if (prev.isDayTime === parsed.isDayTime && prev.theme === parsed.theme) return prev;
                        return { ...parsed, theme: parsed.theme as "light" | "dark" };
                    });
                } catch { }
            }
        };
        loadTheme();

        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === 'selectedTheme') loadTheme();
        };
        const handleCustomThemeEvent = () => loadTheme();

        window.addEventListener('storage', handleStorageEvent);
        window.addEventListener('themeChanged', handleCustomThemeEvent);
        return () => {
            window.removeEventListener('storage', handleStorageEvent);
            window.removeEventListener('themeChanged', handleCustomThemeEvent);
        };
    }, []);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !currentUser) router.push("/");
    }, [currentUser, loading, router]);

    // Set default active tab based on role
    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role === "ceo") {
            setActiveTab("questionnaire");
        } else if (currentUser.role === "supervisor" || currentUser.role === "pm") {
            setActiveTab("scoring");
        } else {
            setActiveTab("results");
        }
    }, [currentUser]);

    // Fetch data when tab/period changes
    useEffect(() => {
        if (!currentUser) return;
        if (activeTab === "questionnaire") fetchAhpData();
        if (activeTab === "optimal") fetchOptimalValues();
        if (activeTab === "scoring") fetchScoringData();
        if (activeTab === "results") fetchResults();
    }, [activeTab, period, currentUser]);

    // ------ Data Fetching ------

    const fetchAhpData = useCallback(async () => {
        try {
            const data = await spkApi.getAhpQuestionnaire(period);
            if (data.result) setAhpResult(data.result);
            if (data.comparisons && data.comparisons.length > 0) {
                setComparisons(data.comparisons.map((c: any) => {
                    const val = parseFloat(c.value);
                    let side: "left" | "right" | "equal" = "equal";
                    let intensity = 1;
                    if (val > 1) { side = "left"; intensity = Math.round(val); }
                    else if (val < 1) { side = "right"; intensity = Math.round(1 / val); }
                    return { ...c, value: val, side, intensity };
                }));
            }
        } catch { }
    }, [period]);

    const fetchOptimalValues = useCallback(async () => {
        try {
            const data = await spkApi.getOptimalValues(period);
            if (data.data) {
                data.data.forEach((ov: any) => {
                    if (ov.target_role === "pm") setOptimalPm({ c1_optimal: ov.c1_optimal, c2_optimal: ov.c2_optimal, c3_optimal: ov.c3_optimal });
                    if (ov.target_role === "employee") setOptimalEmployee({ c1_optimal: ov.c1_optimal, c2_optimal: ov.c2_optimal, c3_optimal: ov.c3_optimal });
                });
            }
        } catch { }
    }, [period]);

    const fetchScoringData = useCallback(async () => {
        if (!currentUser) return;
        try {
            // Get subordinates to score
            if (currentUser.role === "pm") {
                const team = await teamApi.getTeamMembers();
                const members = Array.isArray(team) ? team : team.data || [];
                setSubordinates(members.filter((m: any) => m.role === "employee"));
            } else if (currentUser.role === "supervisor" || currentUser.role === "ceo") {
                const users = await usersApi.getAll();
                const allUsers = Array.isArray(users) ? users : users.data || [];
                if (currentUser.role === "supervisor") {
                    setSubordinates(allUsers.filter((u: any) => u.role === "pm"));
                } else {
                    setSubordinates(allUsers.filter((u: any) => u.role === "pm" || u.role === "employee"));
                }
            }
            // Get existing scores
            const scores = await spkApi.getWorkQuality(period);
            setExistingScores(scores.data || []);
            // Pre-fill scores
            const scoreMap: Record<number, { score: number; notes: string }> = {};
            (scores.data || []).forEach((s: any) => {
                scoreMap[s.scored_user_id] = { score: s.score, notes: s.notes || "" };
            });
            setQualityScores(scoreMap);
        } catch { }
    }, [currentUser, period]);

    const fetchResults = useCallback(async () => {
        setResultsLoading(true);
        try {
            const data = await spkApi.getResults(period, resultsRole);
            setResults(data.data || []);
        } catch { }
        setResultsLoading(false);
    }, [period, resultsRole]);

    useEffect(() => {
        if (activeTab === "results") fetchResults();
    }, [resultsRole]);

    // ------ Handlers ------

    const handleComparisonChange = (index: number, selectedIdx: number) => {
        const newComps = [...comparisons];
        const scaleIdx = selectedIdx;
        // Scale mapping: indices 0-7 mean left side (9,8,7,6,5,4,3,2), index 8 = equal (1), indices 9-16 mean right side (2,3,...,9)
        if (scaleIdx === 8) {
            newComps[index] = { ...newComps[index], value: 1, side: "equal", intensity: 1 };
        } else if (scaleIdx < 8) {
            const val = SCALE_VALUES[scaleIdx];
            newComps[index] = { ...newComps[index], value: val, side: "left", intensity: val };
        } else {
            const val = SCALE_VALUES[scaleIdx];
            newComps[index] = { ...newComps[index], value: 1 / val, side: "right", intensity: val };
        }
        setComparisons(newComps);
    };

    const getSelectedIndex = (comp: typeof comparisons[0]): number => {
        if (comp.side === "equal") return 8;
        if (comp.side === "left") return SCALE_VALUES.indexOf(comp.intensity);
        // right side
        return 8 + comp.intensity - 1;
    };

    const handleSubmitAhp = async () => {
        setAhpLoading(true);
        setAhpError("");
        try {
            const payload = {
                period,
                comparisons: comparisons.map((c) => ({
                    criteria_i: c.criteria_i,
                    criteria_j: c.criteria_j,
                    value: c.value,
                })),
            };
            const data = await spkApi.submitAhpQuestionnaire(payload);
            setAhpResult(data.data);
            if (!data.data.is_consistent) {
                setAhpError("Jawaban TIDAK konsisten (CR > 0.1). Silakan isi ulang kuesioner agar hasilnya konsisten.");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error submitting questionnaire";
            setAhpError(msg);
            if (err.response?.data?.data) setAhpResult(err.response.data.data);
        }
        setAhpLoading(false);
    };

    const handleSaveOptimal = async (role: "pm" | "employee") => {
        setOptimalLoading(true);
        setOptimalMessage("");
        try {
            const values = role === "pm" ? optimalPm : optimalEmployee;
            await spkApi.setOptimalValues({ period, target_role: role, ...values });
            setOptimalMessage(`Nilai optimal ${role.toUpperCase()} berhasil disimpan.`);
        } catch (err: any) {
            setOptimalMessage(err.response?.data?.message || "Error saving optimal values");
        }
        setOptimalLoading(false);
    };

    const handleSubmitScore = async (userId: number) => {
        setScoringLoading(true);
        setScoringMessage("");
        try {
            const scoreData = qualityScores[userId];
            if (!scoreData || scoreData.score === undefined) {
                setScoringMessage("Silakan masukkan skor.");
                setScoringLoading(false);
                return;
            }
            await spkApi.submitWorkQuality({
                scored_user_id: userId,
                score: scoreData.score,
                period,
                notes: scoreData.notes,
            });
            setScoringMessage("Skor berhasil disimpan.");
            fetchScoringData();
        } catch (err: any) {
            setScoringMessage(err.response?.data?.message || "Error saving score");
        }
        setScoringLoading(false);
    };

    const handleCalculateAras = async (role: "pm" | "employee") => {
        setCalcLoading(true);
        setCalcMessage("");
        try {
            const data = await spkApi.calculateAras({ period, target_role: role });
            setCalcMessage(`Perhitungan ARAS untuk ${role.toUpperCase()} berhasil. ${data.data?.results?.length || 0} alternatif diranking.`);
            fetchResults();
        } catch (err: any) {
            setCalcMessage(err.response?.data?.message || "Error calculating ARAS");
        }
        setCalcLoading(false);
    };

    // ------ Theme Colors ------
    const tc = theme.isDayTime
        ? {
            bg: "bg-gray-50", cardBg: "bg-white", text: "text-gray-900", textLight: "text-gray-500",
            textLighter: "text-gray-400", border: "border-gray-200", shadow: "shadow-md",
            inputBg: "bg-white", inputBorder: "border-gray-300", btnPrimary: "bg-blue-600 hover:bg-blue-700",
            btnDanger: "bg-red-500 hover:bg-red-600", btnSuccess: "bg-green-600 hover:bg-green-700",
            tabActive: "bg-blue-100 text-blue-700 border-blue-500", tabInactive: "text-gray-500 hover:bg-gray-100",
            accent: "text-blue-600", headerBg: "bg-gradient-to-r from-blue-600 to-indigo-700",
            cellHighlight: "bg-blue-50", rankGold: "bg-yellow-50 border-yellow-300",
        }
        : {
            bg: "bg-gray-900", cardBg: "bg-gray-800", text: "text-gray-100", textLight: "text-gray-400",
            textLighter: "text-gray-500", border: "border-gray-700", shadow: "shadow-xl shadow-black/30",
            inputBg: "bg-gray-900", inputBorder: "border-gray-600", btnPrimary: "bg-blue-500 hover:bg-blue-600",
            btnDanger: "bg-red-600 hover:bg-red-700", btnSuccess: "bg-green-500 hover:bg-green-600",
            tabActive: "bg-blue-900/50 text-blue-300 border-blue-400", tabInactive: "text-gray-400 hover:bg-gray-700",
            accent: "text-blue-400", headerBg: "bg-gradient-to-r from-blue-800 to-indigo-900",
            cellHighlight: "bg-blue-900/30", rankGold: "bg-yellow-900/30 border-yellow-600",
        };

    if (loading || !currentUser) {
        return (
            <div className={`min-h-screen ${tc.bg} flex items-center justify-center`}>
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Determine available tabs based on role
    const tabs: { id: TabId; label: string; icon: string }[] = [];
    if (currentUser.role === "ceo") {
        tabs.push({ id: "questionnaire", label: "Kuesioner AHP", icon: "📋" });
        tabs.push({ id: "optimal", label: "Nilai Optimal", icon: "🎯" });
        tabs.push({ id: "scoring", label: "Penilaian C2", icon: "⭐" });
        tabs.push({ id: "results", label: "Hasil Ranking", icon: "🏆" });
    } else if (currentUser.role === "supervisor") {
        tabs.push({ id: "scoring", label: "Penilaian C2", icon: "⭐" });
        tabs.push({ id: "results", label: "Hasil Ranking", icon: "🏆" });
    } else if (currentUser.role === "pm") {
        tabs.push({ id: "scoring", label: "Penilaian C2", icon: "⭐" });
        tabs.push({ id: "results", label: "Hasil Ranking", icon: "🏆" });
    }

    return (
        <div className={`min-h-screen ${tc.bg} transition-colors duration-300`}>
            <NavigationBar />
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className={`${tc.headerBg} rounded-2xl p-8 mb-8 text-white`}>
                    <h1 className="text-3xl font-bold mb-2">🏆 Sistem Pendukung Keputusan</h1>
                    <p className="text-blue-100">Penilaian Karyawan dengan Metode AHP & ARAS</p>
                    <div className="mt-4 flex items-center gap-4">
                        <label className="text-sm text-blue-200">Periode:</label>
                        <input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-white/20 text-white border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex gap-2 mb-6 overflow-x-auto pb-2`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${activeTab === tab.id ? tc.tabActive : `${tc.tabInactive} border-transparent`
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ====== TAB: AHP QUESTIONNAIRE (CEO only) ====== */}
                {activeTab === "questionnaire" && currentUser.role === "ceo" && (
                    <div className={`${tc.cardBg} rounded-2xl ${tc.shadow} border ${tc.border} p-6`}>
                        <h2 className={`text-xl font-bold ${tc.text} mb-2`}>📋 Kuesioner Perbandingan Berpasangan</h2>
                        <p className={`text-sm ${tc.textLight} mb-6`}>
                            Bandingkan tingkat kepentingan antar kriteria. Pilih angka yang menunjukkan seberapa penting kriteria di kiri dibandingkan kriteria di kanan (atau sebaliknya).
                        </p>

                        <div className="space-y-8">
                            {comparisons.map((comp, idx) => {
                                const ci = comp.criteria_i as keyof typeof CRITERIA;
                                const cj = comp.criteria_j as keyof typeof CRITERIA;
                                const selectedIdx = getSelectedIndex(comp);

                                return (
                                    <div key={idx} className={`p-5 rounded-xl border ${tc.border} ${tc.cellHighlight}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`font-semibold ${tc.accent} text-sm px-3 py-1 rounded-lg ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/30'}`}>
                                                {CRITERIA[ci]}
                                            </span>
                                            <span className={`text-xs ${tc.textLighter}`}>vs</span>
                                            <span className={`font-semibold ${tc.accent} text-sm px-3 py-1 rounded-lg ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/30'}`}>
                                                {CRITERIA[cj]}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                            {SCALE_VALUES.map((val, sIdx) => (
                                                <button
                                                    key={sIdx}
                                                    onClick={() => handleComparisonChange(idx, sIdx)}
                                                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${selectedIdx === sIdx
                                                        ? sIdx === 8
                                                            ? "bg-gray-600 text-white ring-2 ring-gray-400 scale-110"
                                                            : sIdx < 8
                                                                ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-110"
                                                                : "bg-purple-600 text-white ring-2 ring-purple-400 scale-110"
                                                        : sIdx === 8
                                                            ? `${theme.isDayTime ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`
                                                            : sIdx < 8
                                                                ? `${theme.isDayTime ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'}`
                                                                : `${theme.isDayTime ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'}`
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs">
                                            <span className={`${tc.accent}`}>← {CRITERIA[ci]} lebih penting</span>
                                            <span className={tc.textLighter}>Sama</span>
                                            <span className="text-purple-500">{CRITERIA[cj]} lebih penting →</span>
                                        </div>

                                        <div className={`mt-3 text-center text-sm ${tc.textLight}`}>
                                            {comp.side === "equal" ? (
                                                <span>Kedua kriteria <b>sama penting</b></span>
                                            ) : comp.side === "left" ? (
                                                <span><b>{CRITERIA[ci]}</b> {comp.intensity}× lebih penting dari <b>{CRITERIA[cj]}</b></span>
                                            ) : (
                                                <span><b>{CRITERIA[cj]}</b> {comp.intensity}× lebih penting dari <b>{CRITERIA[ci]}</b></span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleSubmitAhp}
                            disabled={ahpLoading}
                            className={`mt-6 px-6 py-3 ${tc.btnPrimary} text-white rounded-xl font-medium w-full transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                            {ahpLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menghitung...
                                </>
                            ) : (
                                "Submit & Hitung Bobot AHP"
                            )}
                        </button>

                        {ahpError && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                ⚠️ {ahpError}
                            </div>
                        )}

                        {/* AHP Result */}
                        {ahpResult && (
                            <div className={`mt-6 p-6 rounded-xl border ${tc.border} ${ahpResult.is_consistent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <h3 className={`font-bold mb-4 ${ahpResult.is_consistent ? 'text-green-800' : 'text-red-800'}`}>
                                    {ahpResult.is_consistent ? '✅ Hasil Konsisten' : '❌ Hasil TIDAK Konsisten'}
                                </h3>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {ahpResult.weights && Object.entries(ahpResult.weights).map(([key, val]) => (
                                        <div key={key} className="text-center p-3 bg-white rounded-lg shadow-sm">
                                            <div className="text-xs text-gray-500 mb-1">{CRITERIA[key as keyof typeof CRITERIA]}</div>
                                            <div className="text-2xl font-bold text-blue-600">{(Number(val) * 100).toFixed(2)}%</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div className="p-2 bg-white rounded-lg text-center">
                                        <div className="text-xs text-gray-500">λ max</div>
                                        <div className="font-semibold">{Number(ahpResult.lambda_max).toFixed(4)}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg text-center">
                                        <div className="text-xs text-gray-500">CI</div>
                                        <div className="font-semibold">{Number(ahpResult.ci).toFixed(4)}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg text-center">
                                        <div className="text-xs text-gray-500">RI</div>
                                        <div className="font-semibold">{Number(ahpResult.ri).toFixed(4)}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg text-center">
                                        <div className="text-xs text-gray-500">CR</div>
                                        <div className={`font-bold ${Number(ahpResult.cr) <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Number(ahpResult.cr).toFixed(4)}
                                        </div>
                                    </div>
                                </div>

                                {!ahpResult.is_consistent && (
                                    <p className="mt-4 text-sm text-red-600 font-medium">
                                        CR ({Number(ahpResult.cr).toFixed(4)}) &gt; 0.1 — Pengisian tidak konsisten. Silakan isi ulang kuesioner.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ====== TAB: OPTIMAL VALUES (CEO only) ====== */}
                {activeTab === "optimal" && currentUser.role === "ceo" && (
                    <div className="space-y-6">
                        {(["pm", "employee"] as const).map((role) => {
                            const vals = role === "pm" ? optimalPm : optimalEmployee;
                            const setVals = role === "pm" ? setOptimalPm : setOptimalEmployee;
                            return (
                                <div key={role} className={`${tc.cardBg} rounded-2xl ${tc.shadow} border ${tc.border} p-6`}>
                                    <h2 className={`text-xl font-bold ${tc.text} mb-2`}>
                                        🎯 Standar Ideal {role === "pm" ? "Project Manager" : "Employee"}
                                    </h2>
                                    <p className={`text-sm ${tc.textLight} mb-6`}>
                                        Tentukan nilai optimal (A0) sebagai standar ideal perusahaan untuk role {role.toUpperCase()}.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${tc.text} mb-1`}>
                                                C1 - Presensi Aktual (%)
                                            </label>
                                            <input type="number" min="0" max="100" step="0.01"
                                                value={vals.c1_optimal}
                                                onChange={(e) => setVals({ ...vals, c1_optimal: parseFloat(e.target.value) || 0 })}
                                                className={`w-full px-4 py-2 rounded-lg border ${tc.inputBorder} ${tc.inputBg} ${tc.text} focus:ring-2 focus:ring-blue-500`}
                                            />
                                            <p className={`text-xs ${tc.textLighter} mt-1`}>% hari hadir tepat waktu ideal</p>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${tc.text} mb-1`}>
                                                C2 - Kualitas Kerja (0-100)
                                            </label>
                                            <input type="number" min="0" max="100" step="0.01"
                                                value={vals.c2_optimal}
                                                onChange={(e) => setVals({ ...vals, c2_optimal: parseFloat(e.target.value) || 0 })}
                                                className={`w-full px-4 py-2 rounded-lg border ${tc.inputBorder} ${tc.inputBg} ${tc.text} focus:ring-2 focus:ring-blue-500`}
                                            />
                                            <p className={`text-xs ${tc.textLighter} mt-1`}>Skor kualitas kerja ideal</p>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${tc.text} mb-1`}>
                                                C3 - Keterlambatan Tugas (%)
                                            </label>
                                            <input type="number" min="0" max="100" step="0.01"
                                                value={vals.c3_optimal}
                                                onChange={(e) => setVals({ ...vals, c3_optimal: parseFloat(e.target.value) || 0 })}
                                                className={`w-full px-4 py-2 rounded-lg border ${tc.inputBorder} ${tc.inputBg} ${tc.text} focus:ring-2 focus:ring-blue-500`}
                                            />
                                            <p className={`text-xs ${tc.textLighter} mt-1`}>% keterlambatan tugas ideal (semakin rendah semakin baik)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSaveOptimal(role)}
                                        disabled={optimalLoading}
                                        className={`mt-4 px-6 py-2.5 ${tc.btnSuccess} text-white rounded-xl font-medium transition-all disabled:opacity-50`}
                                    >
                                        {optimalLoading ? "Menyimpan..." : `Simpan Standar Ideal ${role.toUpperCase()}`}
                                    </button>
                                </div>
                            );
                        })}

                        {optimalMessage && (
                            <div className={`p-4 rounded-xl border text-sm ${optimalMessage.includes("Error") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                                {optimalMessage}
                            </div>
                        )}
                    </div>
                )}

                {/* ====== TAB: WORK QUALITY SCORING ====== */}
                {activeTab === "scoring" && (
                    <div className={`${tc.cardBg} rounded-2xl ${tc.shadow} border ${tc.border} p-6`}>
                        <h2 className={`text-xl font-bold ${tc.text} mb-2`}>⭐ Penilaian Kualitas Kerja (C2)</h2>
                        <p className={`text-sm ${tc.textLight} mb-6`}>
                            Berikan skor kualitas kerja (0-100) untuk bawahan Anda pada periode {period}.
                        </p>

                        {subordinates.length === 0 ? (
                            <div className={`text-center py-12 ${tc.textLight}`}>
                                <span className="text-4xl mb-4 block">🔍</span>
                                <p>Tidak ada bawahan untuk dinilai.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {subordinates.map((sub) => {
                                    const score = qualityScores[sub.id] || { score: 0, notes: "" };
                                    const existing = existingScores.find((s: any) => s.scored_user_id === sub.id);
                                    return (
                                        <div key={sub.id} className={`p-4 rounded-xl border ${tc.border} ${existing ? tc.cellHighlight : ""}`}>
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${sub.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {sub.initials || sub.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${tc.text}`}>{sub.name}</p>
                                                    <p className={`text-xs ${tc.textLight} capitalize`}>{sub.role} • {sub.department}</p>
                                                </div>
                                                {existing && (
                                                    <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">✓ Sudah dinilai</span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className={`block text-xs font-medium ${tc.textLight} mb-1`}>Skor (0-100)</label>
                                                    <input type="number" min="0" max="100" step="0.01"
                                                        value={score.score}
                                                        onChange={(e) => setQualityScores({
                                                            ...qualityScores,
                                                            [sub.id]: { ...score, score: parseFloat(e.target.value) || 0 },
                                                        })}
                                                        className={`w-full px-3 py-2 rounded-lg border ${tc.inputBorder} ${tc.inputBg} ${tc.text} text-sm focus:ring-2 focus:ring-blue-500`}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className={`block text-xs font-medium ${tc.textLight} mb-1`}>Catatan (opsional)</label>
                                                    <input type="text"
                                                        value={score.notes}
                                                        onChange={(e) => setQualityScores({
                                                            ...qualityScores,
                                                            [sub.id]: { ...score, notes: e.target.value },
                                                        })}
                                                        className={`w-full px-3 py-2 rounded-lg border ${tc.inputBorder} ${tc.inputBg} ${tc.text} text-sm focus:ring-2 focus:ring-blue-500`}
                                                        placeholder="Tambahkan catatan..."
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        onClick={() => handleSubmitScore(sub.id)}
                                                        disabled={scoringLoading}
                                                        className={`px-4 py-2 ${tc.btnPrimary} text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 w-full`}
                                                    >
                                                        {scoringLoading ? "..." : existing ? "Update Skor" : "Simpan Skor"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {scoringMessage && (
                            <div className={`mt-4 p-3 rounded-xl border text-sm ${scoringMessage.includes("Error") || scoringMessage.includes("Silakan") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                                {scoringMessage}
                            </div>
                        )}
                    </div>
                )}

                {/* ====== TAB: RESULTS ====== */}
                {activeTab === "results" && (
                    <div className="space-y-6">
                        {/* Controls */}
                        <div className={`${tc.cardBg} rounded-2xl ${tc.shadow} border ${tc.border} p-6`}>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className={`text-xl font-bold ${tc.text}`}>🏆 Hasil Perankingan ARAS</h2>
                                    <p className={`text-sm ${tc.textLight}`}>Periode: {period}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {(currentUser.role === "ceo" || currentUser.role === "supervisor") && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setResultsRole("pm")}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${resultsRole === "pm" ? tc.tabActive : tc.tabInactive
                                                    }`}
                                            >
                                                Ranking PM
                                            </button>
                                            <button
                                                onClick={() => setResultsRole("employee")}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${resultsRole === "employee" ? tc.tabActive : tc.tabInactive
                                                    }`}
                                            >
                                                Ranking Employee
                                            </button>
                                        </div>
                                    )}

                                    {currentUser.role === "ceo" && (
                                        <button
                                            onClick={() => handleCalculateAras(resultsRole)}
                                            disabled={calcLoading}
                                            className={`px-5 py-2.5 ${tc.btnPrimary} text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2`}
                                        >
                                            {calcLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Menghitung...
                                                </>
                                            ) : (
                                                <>🔄 Hitung ARAS</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {calcMessage && (
                                <div className={`mt-4 p-3 rounded-xl border text-sm ${calcMessage.includes("Error") || calcMessage.includes("No") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                                    {calcMessage}
                                </div>
                            )}
                        </div>

                        {/* Ranking Table */}
                        <div className={`${tc.cardBg} rounded-2xl ${tc.shadow} border ${tc.border} overflow-hidden`}>
                            {resultsLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : results.length === 0 ? (
                                <div className={`text-center py-16 ${tc.textLight}`}>
                                    <span className="text-5xl mb-4 block">📊</span>
                                    <p className="text-lg font-medium mb-2">Belum ada hasil perankingan</p>
                                    <p className="text-sm">
                                        {currentUser.role === "ceo"
                                            ? "Silakan isi kuesioner AHP, set nilai optimal, dan tekan 'Hitung ARAS'."
                                            : "CEO belum menjalankan perhitungan ARAS untuk periode ini."}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className={`${tc.headerBg} text-white`}>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Nama</th>
                                                <th className="px-4 py-3 text-center text-sm font-medium">C1 (Presensi)</th>
                                                <th className="px-4 py-3 text-center text-sm font-medium">C2 (Kualitas)</th>
                                                <th className="px-4 py-3 text-center text-sm font-medium">C3 (Keterlambatan)</th>
                                                <th className="px-4 py-3 text-center text-sm font-medium">Si</th>
                                                <th className="px-4 py-3 text-center text-sm font-medium">Ki</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((r: any) => (
                                                <tr
                                                    key={r.id}
                                                    className={`border-b ${tc.border} transition-colors ${r.rank === 1 ? tc.rankGold : ""
                                                        } hover:${tc.cellHighlight}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {r.rank === 1 && <span className="text-xl">🥇</span>}
                                                            {r.rank === 2 && <span className="text-xl">🥈</span>}
                                                            {r.rank === 3 && <span className="text-xl">🥉</span>}
                                                            <span className={`font-bold ${tc.text}`}>#{r.rank}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${r.user?.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white text-xs font-bold`}>
                                                                {r.user?.initials || r.user?.name?.charAt(0) || "?"}
                                                            </div>
                                                            <div>
                                                                <p className={`font-medium ${tc.text}`}>{r.user?.name || `User #${r.user_id}`}</p>
                                                                <p className={`text-xs ${tc.textLight}`}>{r.user?.department}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 py-3 text-center ${tc.text}`}>{Number(r.c1_value).toFixed(2)}%</td>
                                                    <td className={`px-4 py-3 text-center ${tc.text}`}>{Number(r.c2_value).toFixed(2)}</td>
                                                    <td className={`px-4 py-3 text-center ${tc.text}`}>{Number(r.c3_value).toFixed(2)}%</td>
                                                    <td className={`px-4 py-3 text-center font-mono text-sm ${tc.text}`}>{Number(r.si).toFixed(4)}</td>
                                                    <td className={`px-4 py-3 text-center font-mono text-sm font-bold ${tc.accent}`}>{Number(r.ki).toFixed(4)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
