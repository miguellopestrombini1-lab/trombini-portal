"use client";

import { useState, useMemo } from "react";
import { useDb } from "../../lib/useDb";
import { Project, EditorId } from "../../lib/types";

type ViewMode = "semanal" | "mensal" | "anual";

export default function AgendaPage() {
    const { data, loading, error } = useDb();
    const [viewMode, setViewMode] = useState<ViewMode>("semanal");
    const [filterEditor, setFilterEditor] = useState<EditorId | "todos">("todos");

    const allTasks = useMemo(() => {
        if (!data) return [];
        const tasks: { clientName: string; project: Project; editorId: EditorId }[] = [];
        data.clients.forEach(client => {
            client.projects.forEach(project => {
                if (project.scheduledDate) {
                    tasks.push({
                        clientName: client.name,
                        project,
                        editorId: client.editorId
                    });
                }
            });
        });
        return tasks.sort((a, b) => (a.project.scheduledDate || "").localeCompare(b.project.scheduledDate || ""));
    }, [data]);

    const filteredTasks = useMemo(() => {
        return allTasks.filter(task => filterEditor === "todos" || task.editorId === filterEditor);
    }, [allTasks, filterEditor]);

    // Agrupamento por semana, mês ou ano
    const groupedTasks = useMemo(() => {
        const groups: Record<string, typeof filteredTasks> = {};

        filteredTasks.forEach(task => {
            const date = new Date(task.project.scheduledDate!);
            let key = "";

            if (viewMode === "semanal") {
                // Get ISO week
                const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                const dayNum = d.getUTCDay() || 7;
                d.setUTCDate(d.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                key = `Semana ${weekNo} - ${d.getUTCFullYear()}`;
            } else if (viewMode === "mensal") {
                key = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
            } else {
                key = date.getFullYear().toString();
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(task);
        });

        return groups;
    }, [filteredTasks, viewMode]);

    if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Carregando Agenda...</span></div>;

    if (error) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#080808]">
            <span className="text-4xl mb-4">⚠️</span>
            <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-white transition-all">Tentar Novamente</button>
        </div>
    );

    const statusColors: Record<string, string> = {
        "Atrasado": "text-red-400 bg-red-400/10 border-red-400/20",
        "Aguardando": "text-amber-400 bg-amber-400/10 border-amber-400/20",
        "Em edição": "text-blue-400 bg-blue-400/10 border-blue-400/20",
        "Entregue": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 bg-[#080808] animate-fade-in">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Agenda</h2>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    {(["miguel", "diogo", "todos"] as const).map(editor => (
                        <button
                            key={editor}
                            onClick={() => setFilterEditor(editor)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${filterEditor === editor ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}
                        >
                            {editor}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    {(["semanal", "mensal", "anual"] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === mode ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-12">
                {Object.keys(groupedTasks).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <span className="text-4xl mb-4">🗓️</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Nenhum vídeo agendado</p>
                    </div>
                ) : (
                    Object.entries(groupedTasks).map(([group, tasks]) => (
                        <div key={group} className="animate-fade-in">
                            <h3 className="text-[11px] font-black text-white px-4 py-2 border-l-2 border-white mb-6 uppercase tracking-widest bg-gradient-to-r from-white/5 to-transparent inline-block rounded-r-lg">
                                {group}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {tasks.map((task, idx) => (
                                    <div
                                        key={idx}
                                        className="group bg-[#0f0f0f] border border-white/[0.03] hover:border-white/10 rounded-2xl p-5 transition-all hover:bg-[#121212] relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 right-0 w-1 h-full ${task.editorId === 'miguel' ? 'bg-blue-500/30' : 'bg-emerald-500/30'}`} />

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{task.clientName}</p>
                                                <h4 className="text-xs font-black text-white uppercase group-hover:text-amber-400 transition-all">{task.project.name}</h4>
                                            </div>
                                            <span className={`text-[7px] font-black uppercase px-2 py-1 rounded-lg border ${statusColors[task.project.status]}`}>
                                                {task.project.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-[9px] font-bold">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <span>📅</span>
                                                <span className="text-gray-300">
                                                    {new Date(task.project.scheduledDate!).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${task.editorId === 'miguel' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                <span className="text-gray-500 uppercase text-[8px] tracking-widest">{task.editorId}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center opacity-30">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Sistema de Agenda Trombiny v2.0</p>
                <div className="flex gap-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
            </footer>
        </div>
    );
}
