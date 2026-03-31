"use client";

import { useState, useMemo } from "react";
import { useDb } from "../../lib/useDb";
import { Project } from "../../lib/types";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function EdicoesPage() {
    const { data, loading, error, saveData } = useDb();
    const [viewMode, setViewMode] = useState<"list" | "month" | "week">("list");
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Agregados
    const allEditions = useMemo(() => {
        if (!data) return [];
        const editions: { clientId: string, clientName: string, project: Project }[] = [];
        data.clients.forEach(client => {
            client.projects.forEach(project => {
                if (project.type !== "raw") {
                    editions.push({ clientId: client.id, clientName: client.name, project });
                }
            });
        });
        return editions;
    }, [data]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Carregando Edições...</span>
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#080808]">
            <span className="text-4xl mb-4">⚠️</span>
            <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error || 'Dados não encontrados'}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-white transition-all">Tentar Novamente</button>
        </div>
    );

    const updateProject = (clientId: string, projectId: string, updates: Partial<Project>) => {
        const newData = { ...data };
        const client = newData.clients.find(c => c.id === clientId);
        if (client) {
            client.projects = client.projects.map(p => p.id === projectId ? { ...p, ...updates } : p);
            saveData(newData);
        }
    };

    const toggleDelivered = (clientId: string, projectId: string) => {
        const client = data.clients.find(c => c.id === clientId);
        const p = client?.projects.find(proj => proj.id === projectId);
        if (p) {
            const isDelivered = p.status === "Entregue";
            updateProject(clientId, projectId, {
                status: isDelivered ? "Aguardando" : "Entregue",
                deliveredAt: isDelivered ? "" : new Date().toLocaleDateString("pt-BR")
            });
        }
    };

    const deleteProject = (clientId: string, projectId: string) => {
        if (!confirm("Remover projeto?")) return;
        const newData = { ...data };
        const client = newData.clients.find(c => c.id === clientId);
        if (client) {
            client.projects = client.projects.filter(p => p.id !== projectId);
            saveData(newData);
        }
    };

    const prevMonth = () => { if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(y => y - 1); } else setCurrentMonthIdx(m => m - 1); };
    const nextMonth = () => { if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(y => y + 1); } else setCurrentMonthIdx(m => m + 1); };

    const typeColor: Record<string, string> = {
        reels: "text-pink-400 bg-pink-400/10 border-pink-400/20",
        youtube: "text-red-400 bg-red-400/10 border-red-400/20"
    };

    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();

    return (
        <div className="min-h-screen bg-[#080808] p-8 lg:p-12 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Edições</h2>
            </header>

            <div className="flex gap-2 mb-8 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5 w-fit">
                {([["list", "📋 Lista"], ["month", "📅 Mensal"], ["week", "📆 Semanal"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setViewMode(key)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === key ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-300"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {viewMode === "list" && (
                <div className="space-y-2">
                    <div className="grid grid-cols-[2fr_1fr_0.7fr_0.6fr_1fr_1fr_0.3fr] gap-3 px-5 py-3 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                        <span>Projeto</span><span>Cliente</span><span className="text-center">Tipo</span><span className="text-center">✓</span><span className="text-center">Data Entrega</span><span className="text-center">Arquivo</span><span className="text-center">⚙</span>
                    </div>
                    {allEditions.map(e => {
                        const isDelivered = e.project.status === "Entregue";
                        return (
                        <div key={e.project.id}>
                            <div className={`grid grid-cols-[2fr_1fr_0.7fr_0.6fr_1fr_1fr_0.3fr] gap-3 items-center px-5 py-3 rounded-xl border transition-all ${isDelivered ? "bg-emerald-500/[0.03] border-emerald-500/10" : "bg-white/[0.02] border-white/[0.03] hover:border-white/10"}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDelivered ? "bg-emerald-500" : "bg-amber-400"}`} />
                                    <input value={e.project.name} onChange={ev => updateProject(e.clientId, e.project.id, { name: ev.target.value })} placeholder="Nome..." className={`bg-transparent text-xs font-black uppercase outline-none w-full placeholder:text-gray-700 ${isDelivered ? "text-gray-500 line-through" : "text-white"}`} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{e.clientName}</span>
                                <div className="flex justify-center">
                                    <select value={e.project.type} onChange={ev => updateProject(e.clientId, e.project.id, { type: ev.target.value as Project['type'] })} className={`bg-transparent text-[8px] font-black uppercase px-2 py-1 rounded-lg border outline-none cursor-pointer ${typeColor[e.project.type] || ""}`}>
                                        <option value="reels" className="bg-[#111]">Reels</option>
                                        <option value="youtube" className="bg-[#111]">YouTube</option>
                                    </select>
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => toggleDelivered(e.clientId, e.project.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDelivered ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 hover:border-white/30"}`}>
                                        {isDelivered && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                                    </button>
                                </div>
                                <input type="text" placeholder="DD/MM/AAAA" value={e.project.deliveredAt || ""} onChange={ev => updateProject(e.clientId, e.project.id, { deliveredAt: ev.target.value })} className="bg-transparent border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-center text-gray-300 placeholder:text-gray-700 outline-none" />
                                <div className="flex justify-center">
                                    <button onClick={() => setExpandedId(expandedId === e.project.id ? null : e.project.id)} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase text-gray-400 hover:text-white transition-all">
                                        {e.project.path ? "📎 Detalhes" : "+ Detalhes"}
                                    </button>
                                </div>
                                <button onClick={() => deleteProject(e.clientId, e.project.id)} className="text-gray-700 hover:text-red-500 text-xs text-center">✕</button>
                            </div>

                            {expandedId === e.project.id && (
                                <div className="ml-6 mt-1 mb-3 p-5 bg-white/[0.015] border border-white/[0.04] rounded-xl space-y-4 animate-fade-in">
                                    <div>
                                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Caminho / Link</label>
                                        <input type="text" value={e.project.path || ""} onChange={ev => updateProject(e.clientId, e.project.id, { path: ev.target.value })} placeholder="Caminho no drive ou link..." className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-700 outline-none" />
                                    </div>
                                    {e.project.path && <a href={e.project.path.startsWith("http") ? e.project.path : "https://drive.google.com"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest">🔗 Abrir Link ➔</a>}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}

            {viewMode === "month" && (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">←</button>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{MONTHS[currentMonthIdx]} {currentYear}</h3>
                        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        {WEEK_DAYS.map(d => <div key={d} className="bg-[#0a0a0a] p-3 text-[9px] font-black uppercase text-gray-600 text-center">{d}</div>)}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="bg-[#080808] min-h-[80px] p-2 border-t border-r border-white/[0.03]" />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateMatch = `${day}/${String(currentMonthIdx + 1).padStart(2, "0")}/${currentYear}`;
                            return (
                                <div key={day} className="bg-[#080808] min-h-[80px] p-2 border-t border-r border-white/[0.03] hover:bg-white/[0.02] transition-all">
                                    <span className="text-[9px] font-black text-gray-700">{day}</span>
                                    {allEditions.filter(e => e.project.deliveredAt === dateMatch).map(e => (
                                        <div key={e.project.id} className={`mt-1 p-1 rounded text-[7px] font-black truncate bg-emerald-500/10 text-emerald-400`}>{e.project.name}</div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {viewMode === "week" && (
                <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-6">Semana Atual</p>
                    <div className="grid grid-cols-7 gap-3">
                        {WEEK_DAYS.map((d, idx) => {
                            const today = new Date();
                            const dayOfWeek = today.getDay();
                            const diff = idx - dayOfWeek;
                            const date = new Date(today); date.setDate(today.getDate() + diff);
                            const dateStr = date.toLocaleDateString("pt-BR");
                            const isToday = diff === 0;
                            return (
                                <div key={d} className={`bg-[#0f0f0f] border rounded-xl p-4 min-h-[200px] transition-all ${isToday ? "border-purple-500/30 bg-purple-500/[0.03]" : "border-white/[0.03]"}`}>
                                    <p className={`text-[10px] font-black uppercase mb-1 ${isToday ? "text-purple-400" : "text-gray-600"}`}>{d}</p>
                                    <p className="text-[8px] text-gray-700 font-bold mb-3">{dateStr}</p>
                                    {allEditions.filter(e => e.project.deliveredAt === dateStr).map(e => (
                                        <div key={e.project.id} className={`p-2 rounded-lg mb-1.5 text-[8px] font-black uppercase truncate bg-emerald-500/10 text-emerald-400`}>{e.project.name}</div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
