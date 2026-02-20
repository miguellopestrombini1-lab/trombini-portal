"use client";

import { useState, useRef } from "react";
import { clients as initialClients } from "../../lib/db";
import { Status } from "../../lib/types";

type EditProject = {
    id: string; name: string; client: string; type: "reels" | "youtube";
    status: Status; delivered: boolean; deliveryDate: string;
    link: string; fileUrl: string; fileName: string; notes: string;
};

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function EdicoesPage() {
    const [viewMode, setViewMode] = useState<"list" | "month" | "week">("list");
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

    // Inicializar projetos de edição de todos os clientes
    const [projects, setProjects] = useState<EditProject[]>(() => {
        const all: EditProject[] = [];
        initialClients.forEach(c => {
            c.projects.filter(p => p.type !== "raw").forEach(p => {
                all.push({
                    id: p.id, name: p.name, client: c.name,
                    type: p.type === "youtube" ? "youtube" : "reels",
                    status: p.status, delivered: p.status === "Entregue",
                    deliveryDate: p.deliveredAt || "", link: "", fileUrl: "", fileName: "", notes: "",
                });
            });
        });
        return all;
    });

    const update = (id: string, field: keyof EditProject, value: string | boolean) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const toggleDelivered = (id: string) => {
        setProjects(prev => prev.map(p =>
            p.id === id ? { ...p, delivered: !p.delivered, status: !p.delivered ? "Entregue" : "Aguardando", deliveryDate: !p.delivered ? new Date().toLocaleDateString("pt-BR") : "" } : p
        ));
    };

    const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

    const addProject = () => {
        const np: EditProject = { id: `edp-${Date.now()}`, name: "", client: "", type: "reels", status: "Aguardando", delivered: false, deliveryDate: "", link: "", fileUrl: "", fileName: "", notes: "" };
        setProjects(prev => [...prev, np]);
        setExpandedId(np.id);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadTargetId) {
            const url = URL.createObjectURL(file);
            setProjects(prev => prev.map(p => p.id === uploadTargetId ? { ...p, fileUrl: url, fileName: file.name } : p));
        }
    };

    const prevMonth = () => { if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(y => y - 1); } else setCurrentMonthIdx(m => m - 1); };
    const nextMonth = () => { if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(y => y + 1); } else setCurrentMonthIdx(m => m + 1); };

    const typeColor: Record<string, string> = { reels: "text-pink-400 bg-pink-400/10 border-pink-400/20", youtube: "text-red-400 bg-red-400/10 border-red-400/20" };

    // Calendário
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();

    return (
        <div className="min-h-screen bg-[#080808] p-8 lg:p-12 animate-fade-in">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*,.mp4,.mov" className="hidden" />

            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Edições</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Departamento / Trombiny Produções</p>
                </div>
                <button onClick={addProject} className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]">+ Novo Projeto</button>
            </header>

            {/* Modos de visualização */}
            <div className="flex gap-2 mb-8 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5 w-fit">
                {([["list", "📋 Lista"], ["month", "📅 Mensal"], ["week", "📆 Semanal"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setViewMode(key)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === key ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-300"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ===== LISTA ===== */}
            {viewMode === "list" && (
                <div className="space-y-2">
                    <div className="grid grid-cols-[2fr_1fr_0.7fr_0.6fr_1fr_1fr_0.3fr] gap-3 px-5 py-3 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                        <span>Projeto</span><span>Cliente</span><span className="text-center">Tipo</span><span className="text-center">✓</span><span className="text-center">Data Entrega</span><span className="text-center">Arquivo</span><span className="text-center">⚙</span>
                    </div>
                    {projects.map(p => (
                        <div key={p.id}>
                            <div className={`grid grid-cols-[2fr_1fr_0.7fr_0.6fr_1fr_1fr_0.3fr] gap-3 items-center px-5 py-3 rounded-xl border transition-all ${p.delivered ? "bg-emerald-500/[0.03] border-emerald-500/10" : "bg-white/[0.02] border-white/[0.03] hover:border-white/10"}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.delivered ? "bg-emerald-500" : "bg-amber-400"}`} />
                                    <input value={p.name} onChange={e => update(p.id, "name", e.target.value)} placeholder="Nome..." className={`bg-transparent text-xs font-black uppercase outline-none w-full placeholder:text-gray-700 ${p.delivered ? "text-gray-500 line-through" : "text-white"}`} />
                                </div>
                                <input value={p.client} onChange={e => update(p.id, "client", e.target.value)} placeholder="Cliente..." className="bg-transparent text-[10px] font-bold text-gray-400 outline-none placeholder:text-gray-700" />
                                <div className="flex justify-center">
                                    <select value={p.type} onChange={e => update(p.id, "type", e.target.value)} className={`bg-transparent text-[8px] font-black uppercase px-2 py-1 rounded-lg border outline-none cursor-pointer ${typeColor[p.type]}`}>
                                        <option value="reels" className="bg-[#111]">Reels</option>
                                        <option value="youtube" className="bg-[#111]">YouTube</option>
                                    </select>
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => toggleDelivered(p.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${p.delivered ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 hover:border-white/30"}`}>
                                        {p.delivered && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                                    </button>
                                </div>
                                <input type="text" placeholder="DD/MM/AAAA" value={p.deliveryDate} onChange={e => update(p.id, "deliveryDate", e.target.value)} className="bg-transparent border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-center text-gray-300 placeholder:text-gray-700 outline-none" />
                                <div className="flex justify-center">
                                    <button onClick={() => { setUploadTargetId(p.id); setExpandedId(expandedId === p.id ? null : p.id); }} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase text-gray-400 hover:text-white transition-all">
                                        {p.fileName ? "📎 " + p.fileName.substring(0, 10) : "+ Arquivo"}
                                    </button>
                                </div>
                                <button onClick={() => deleteProject(p.id)} className="text-gray-700 hover:text-red-500 text-xs text-center">✕</button>
                            </div>

                            {expandedId === p.id && (
                                <div className="ml-6 mt-1 mb-3 p-5 bg-white/[0.015] border border-white/[0.04] rounded-xl space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Link</label>
                                            <input type="url" value={p.link} onChange={e => update(p.id, "link", e.target.value)} placeholder="https://..." className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-700 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Upload de Arquivo</label>
                                            <button onClick={() => { setUploadTargetId(p.id); fileInputRef.current?.click(); }} className="w-full bg-white/[0.03] border border-dashed border-white/10 hover:border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-500 hover:text-white transition-all text-left">
                                                {p.fileName || "Clique para upload..."}
                                            </button>
                                        </div>
                                    </div>
                                    <textarea value={p.notes} onChange={e => update(p.id, "notes", e.target.value)} placeholder="Observações..." rows={2} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-700 outline-none resize-none" />
                                    {p.fileUrl && (
                                        <div>
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Player</label>
                                            <video controls src={p.fileUrl} className="w-full rounded-xl border border-white/5 bg-black max-h-[300px]" />
                                        </div>
                                    )}
                                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest">🔗 Abrir Link ➔</a>}
                                </div>
                            )}
                        </div>
                    ))}
                    <button onClick={addProject} className="w-full mt-3 py-3 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-white border border-dashed border-white/5 hover:border-white/10 rounded-xl transition-all">+ Adicionar Projeto</button>
                </div>
            )}

            {/* ===== MENSAL ===== */}
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
                            return (
                                <div key={day} className="bg-[#080808] min-h-[80px] p-2 border-t border-r border-white/[0.03] hover:bg-white/[0.02] transition-all">
                                    <span className="text-[9px] font-black text-gray-700">{day}</span>
                                    {projects.filter(p => p.deliveryDate.includes(`/${String(currentMonthIdx + 1).padStart(2, "0")}/${currentYear}`) && parseInt(p.deliveryDate.split("/")[0]) === day).map(p => (
                                        <div key={p.id} className={`mt-1 p-1 rounded text-[7px] font-black truncate ${p.delivered ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"}`}>{p.name}</div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== SEMANAL ===== */}
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
                                    {projects.filter(p => p.deliveryDate === dateStr).map(p => (
                                        <div key={p.id} className={`p-2 rounded-lg mb-1.5 text-[8px] font-black uppercase truncate ${p.delivered ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{p.name}</div>
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
