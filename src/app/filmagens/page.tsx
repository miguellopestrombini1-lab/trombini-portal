"use client";

import { useState, useMemo } from "react";
import { useDb } from "../../lib/useDb";
import { Project, Equipment } from "../../lib/types";

// Meses do ano
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function FilmagensPage() {
    const { data, loading, error, saveData } = useDb();
    const [activeSection, setActiveSection] = useState<"agenda" | "inventario" | "drive">("agenda");
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());

    const [selectedProjectId, setSelectedProjectId] = useState<{clientId: string, projectId: string} | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form para novo evento
    const [newEvent, setNewEvent] = useState({
        clientId: "",
        name: "",
        local: "",
        date: "",
        time: "",
        notes: ""
    });

    // Projetos de filmagem agregados
    const allFilmings = useMemo(() => {
        if (!data) return [];
        const filmings: { clientId: string, clientName: string, project: Project }[] = [];
        data.clients.forEach(client => {
            client.projects.forEach(project => {
                if (project.type === "raw") {
                    filmings.push({ clientId: client.id, clientName: client.name, project });
                }
            });
        });
        return filmings;
    }, [data]);

    const selectedProjectData = useMemo(() => {
        if (!selectedProjectId || !data) return null;
        const client = data.clients.find(c => c.id === selectedProjectId.clientId);
        if (!client) return null;
        const project = client.projects.find(p => p.id === selectedProjectId.projectId);
        if (!project) return null;
        return { client, project };
    }, [selectedProjectId, data]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Carregando Filmagens...</span>
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

    const deleteProject = (clientId: string, projectId: string) => {
        if (!confirm("Tem certeza que deseja remover esta filmagem?")) return;
        const newData = { ...data };
        const client = newData.clients.find(c => c.id === clientId);
        if (client) {
            client.projects = client.projects.filter(p => p.id !== projectId);
            saveData(newData);
            setSelectedProjectId(null);
        }
    };

    const addEvent = () => {
        if (newEvent.clientId && newEvent.name && newEvent.date) {
            const newData = { ...data };
            const client = newData.clients.find(c => c.id === newEvent.clientId);
            if (client) {
                const project: Project = {
                    id: `film-${Date.now()}`,
                    name: newEvent.name,
                    year: parseInt(newEvent.date.split("-")[0]),
                    month: MONTHS[parseInt(newEvent.date.split("-")[1]) - 1],
                    status: "Aguardando",
                    type: "raw",
                    scheduledDate: newEvent.date,
                    location: newEvent.local,
                    time: newEvent.time,
                    notes: newEvent.notes,
                    equipmentIds: []
                };
                client.projects.push(project);
                saveData(newData);
                setNewEvent({ clientId: "", name: "", local: "", date: "", time: "", notes: "" });
                setShowAddModal(false);
            }
        }
    };

    const updateEquipment = (id: string, updates: Partial<Equipment>) => {
        const newData = { ...data };
        newData.inventory = newData.inventory.map(e => e.id === id ? { ...e, ...updates } : e);
        saveData(newData);
    };

    const addEquipment = () => {
        const newData = { ...data };
        newData.inventory.push({
            id: `eq-${Date.now()}`,
            name: "Novo Equipamento",
            type: "Câmera",
            isAvailable: true,
            specs: ""
        });
        saveData(newData);
    };

    const deleteEquipment = (id: string) => {
        if (!confirm("Remover equipamento?")) return;
        const newData = { ...data };
        newData.inventory = newData.inventory.filter(e => e.id !== id);
        saveData(newData);
    };

    const toggleEquipmentInProject = (equipmentId: string) => {
        if (!selectedProjectData) return;
        const currentIds = selectedProjectData.project.equipmentIds || [];
        const newIds = currentIds.includes(equipmentId)
            ? currentIds.filter(id => id !== equipmentId)
            : [...currentIds, equipmentId];
        updateProject(selectedProjectData.client.id, selectedProjectData.project.id, { equipmentIds: newIds });
    };

    // Calendário helpers
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();

    const prevMonth = () => {
        if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(y => y - 1); }
        else setCurrentMonthIdx(m => m - 1);
    };
    const nextMonth = () => {
        if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(y => y + 1); }
        else setCurrentMonthIdx(m => m + 1);
    };

    return (
        <div className="min-h-screen bg-[#080808] p-8 lg:p-12 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Filmagens</h2>
            </header>

            {/* Sub-navegação */}
            <div className="flex gap-2 mb-10 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5 w-fit">
                {([["agenda", "📅 Agenda"], ["inventario", "🎥 Inventário"], ["drive", "📁 Drive"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveSection(key)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === key ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-300"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ============= AGENDA ============= */}
            {activeSection === "agenda" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">←</button>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{MONTHS[currentMonthIdx]} {currentYear}</h3>
                                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">→</button>
                            </div>
                            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">+ Nova Filmagem</button>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                            {WEEK_DAYS.map(d => <div key={d} className="bg-[#0a0a0a] p-3 text-[9px] font-black uppercase text-gray-600 text-center">{d}</div>)}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="bg-[#080808] min-h-[90px] p-3 border-t border-r border-white/[0.03]" />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const dayEvents = allFilmings.filter(f => f.project.scheduledDate === dateStr);
                                const isToday = new Date().toISOString().startsWith(dateStr);
                                return (
                                    <div key={day} className={`bg-[#080808] min-h-[90px] p-2 border-t border-r border-white/[0.03] hover:bg-white/[0.02] transition-all ${isToday ? "ring-inset ring-1 ring-blue-500/30" : ""}`}>
                                        <span className={`text-[10px] font-black ${isToday ? "text-blue-400" : "text-gray-700"}`}>{day}</span>
                                        {dayEvents.map(f => (
                                            <div key={f.project.id} onClick={() => setSelectedProjectId({clientId: f.clientId, projectId: f.project.id})} className="mt-1 p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-all">
                                                <p className="text-[8px] font-black text-white uppercase truncate">{f.clientName}</p>
                                                <p className="text-[7px] text-blue-300 uppercase font-bold truncate">{f.project.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#0f0f0f] border border-white/[0.03] rounded-2xl p-6 sticky top-20">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 pb-3 border-b border-white/5">Detalhes da Filmagem</h4>
                            {selectedProjectData ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="text-[7px] font-black text-gray-600 uppercase">Cliente</label>
                                        <p className="text-xs font-black text-white uppercase">{selectedProjectData.client.name}</p>
                                    </div>
                                    <input value={selectedProjectData.project.name} onChange={e => updateProject(selectedProjectData.client.id, selectedProjectData.project.id, { name: e.target.value })} className="w-full bg-transparent text-lg font-black text-white uppercase outline-none" placeholder="Nome do Show/Evento" />
                                    <input value={selectedProjectData.project.location || ""} onChange={e => updateProject(selectedProjectData.client.id, selectedProjectData.project.id, { location: e.target.value })} placeholder="Local..." className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-blue-400 font-bold outline-none" />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="date" value={selectedProjectData.project.scheduledDate || ""} onChange={e => updateProject(selectedProjectData.client.id, selectedProjectData.project.id, { scheduledDate: e.target.value })} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-[10px] text-gray-300 outline-none" />
                                        <input type="time" value={selectedProjectData.project.time || ""} onChange={e => updateProject(selectedProjectData.client.id, selectedProjectData.project.id, { time: e.target.value })} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-[10px] text-gray-300 outline-none" />
                                    </div>

                                    <div>
                                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Equipamentos</label>
                                        <div className="flex flex-wrap gap-1">
                                            {data.inventory.map(eq => {
                                                const isSelected = selectedProjectData.project.equipmentIds?.includes(eq.id);
                                                return (
                                                    <button
                                                        key={eq.id}
                                                        onClick={() => toggleEquipmentInProject(eq.id)}
                                                        className={`px-2 py-1 rounded text-[7px] font-black uppercase transition-all ${isSelected ? "bg-blue-500 text-white" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
                                                    >
                                                        {eq.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <textarea value={selectedProjectData.project.notes || ""} onChange={e => updateProject(selectedProjectData.client.id, selectedProjectData.project.id, { notes: e.target.value })} placeholder="Observações do set..." rows={3} className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none placeholder:text-gray-700" />

                                    <button onClick={() => deleteProject(selectedProjectData.client.id, selectedProjectData.project.id)} className="w-full py-2 text-[9px] font-black uppercase text-red-500/50 hover:text-red-500 border border-red-500/10 hover:border-red-500/30 rounded-lg transition-all">Remover Filmagem</button>
                                </div>
                            ) : (
                                <div className="text-center py-12 opacity-20">
                                    <span className="text-3xl block mb-3">📅</span>
                                    <p className="text-[8px] font-black uppercase tracking-widest">Selecione uma filmagem</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {showAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-black text-white uppercase">Nova Filmagem</h3>

                                <select
                                    value={newEvent.clientId}
                                    onChange={e => setNewEvent(p => ({ ...p, clientId: e.target.value }))}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value="" className="bg-[#111]">Selecione o Cliente</option>
                                    {data.clients.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>)}
                                </select>

                                <input value={newEvent.name} onChange={e => setNewEvent(p => ({ ...p, name: e.target.value }))} placeholder="Nome da Gravação (ex: Show Curitiba)" className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600" />
                                <input value={newEvent.local} onChange={e => setNewEvent(p => ({ ...p, local: e.target.value }))} placeholder="Local" className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600" />

                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none" />
                                    <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none" />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Cancelar</button>
                                    <button onClick={addEvent} className="flex-1 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">Adicionar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============= INVENTÁRIO ============= */}
            {activeSection === "inventario" && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.inventory.map(eq => (
                            <div key={eq.id} className="bg-[#0f0f0f] border border-white/[0.03] rounded-2xl p-6 hover:border-white/10 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <select
                                        value={eq.type}
                                        onChange={e => updateEquipment(eq.id, { type: e.target.value as Equipment['type'] })}
                                        className="bg-transparent text-[9px] font-black text-gray-500 uppercase tracking-widest outline-none cursor-pointer"
                                    >
                                        <option value="Câmera" className="bg-[#111]">Câmera</option>
                                        <option value="Lente" className="bg-[#111]">Lente</option>
                                        <option value="Áudio" className="bg-[#111]">Áudio</option>
                                        <option value="Iluminação" className="bg-[#111]">Iluminação</option>
                                        <option value="Outro" className="bg-[#111]">Outro</option>
                                    </select>
                                    <button
                                        onClick={() => updateEquipment(eq.id, { isAvailable: !eq.isAvailable })}
                                        className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border cursor-pointer ${eq.isAvailable ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}
                                    >
                                        {eq.isAvailable ? "Disponível" : "Em Uso"}
                                    </button>
                                </div>
                                <input value={eq.name} onChange={e => updateEquipment(eq.id, { name: e.target.value })} placeholder="Nome do equipamento..." className="w-full bg-transparent text-base font-black text-white uppercase outline-none placeholder:text-gray-700 mb-1" />
                                <input value={eq.specs || ""} onChange={e => updateEquipment(eq.id, { specs: e.target.value })} placeholder="Especificações..." className="w-full bg-transparent text-[10px] text-gray-500 font-bold outline-none placeholder:text-gray-700" />
                                <button onClick={() => deleteEquipment(eq.id)} className="mt-4 text-[8px] font-bold text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">Remover</button>
                            </div>
                        ))}
                        <button onClick={addEquipment} className="border border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center opacity-30 hover:opacity-100 transition-all cursor-pointer min-h-[150px]">
                            <span className="text-3xl mb-3">+</span>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Novo Equipamento</p>
                        </button>
                    </div>
                </div>
            )}

            {/* ============= DRIVE ============= */}
            {activeSection === "drive" && (
                <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-6">Pastas de filmagem vinculadas</p>
                    {allFilmings.filter(f => f.project.path).map((f, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/[0.03] rounded-xl hover:border-white/10 transition-all group">
                            <span className="text-2xl">📂</span>
                            <div className="flex-1">
                                <p className="text-sm font-black text-white uppercase">{f.clientName} - {f.project.name}</p>
                                <code className="text-[9px] text-gray-600 font-mono">{f.project.path}</code>
                            </div>
                            <a href={f.project.path?.startsWith("http") ? f.project.path : "https://drive.google.com"} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Abrir Drive ➔</a>
                        </div>
                    ))}
                    {allFilmings.filter(f => f.project.path).length === 0 && (
                        <p className="text-xs text-gray-600 italic">Nenhum caminho de drive configurado nos projetos de filmagem.</p>
                    )}
                </div>
            )}
        </div>
    );
}
