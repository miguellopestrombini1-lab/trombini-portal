"use client";

import { useState, useRef } from "react";
import { inventory as initialInventory, locations as initialLocations } from "../../lib/db";
import { Equipment } from "../../lib/types";

// Meses do ano
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type FilmEvent = { id: string; title: string; local: string; date: string; time: string; notes: string; };

export default function FilmagensPage() {
    const [activeSection, setActiveSection] = useState<"agenda" | "inventario" | "drive">("agenda");
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(1); // Fevereiro
    const [events, setEvents] = useState<FilmEvent[]>([
        { id: "ev1", title: "Afonso Padilha", local: "Teatro das Artes", date: "2026-02-20", time: "20:00", notes: "" },
        { id: "ev2", title: "4 Amigos", local: "Jundiaí", date: "2026-02-27", time: "21:00", notes: "" },
    ]);
    const [selectedEvent, setSelectedEvent] = useState<FilmEvent | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvent, setNewEvent] = useState<FilmEvent>({ id: "", title: "", local: "", date: "", time: "", notes: "" });

    // Inventário
    const [equipments, setEquipments] = useState<(Equipment & { imageUrl?: string })[]>(initialInventory.map(e => ({ ...e, imageUrl: undefined })));
    const eqImageRef = useRef<HTMLInputElement>(null);
    const [editingEqId, setEditingEqId] = useState<string | null>(null);
    const [editingEqField, setEditingEqField] = useState<string | null>(null);

    const updateEquipment = (id: string, field: string, value: string | boolean | undefined) => {
        setEquipments(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleEqImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingEqId) {
            const url = URL.createObjectURL(file);
            setEquipments(prev => prev.map(eq => eq.id === editingEqId ? { ...eq, imageUrl: url } : eq));
        }
    };

    const addEquipment = () => {
        setEquipments(prev => [...prev, { id: `eq-${Date.now()}`, name: "", type: "Câmera", isAvailable: true, specs: "", imageUrl: undefined }]);
    };

    const deleteEquipment = (id: string) => setEquipments(prev => prev.filter(e => e.id !== id));

    // Agenda helpers
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();

    const addEvent = () => {
        if (newEvent.title && newEvent.date) {
            setEvents(prev => [...prev, { ...newEvent, id: `ev-${Date.now()}` }]);
            setNewEvent({ id: "", title: "", local: "", date: "", time: "", notes: "" });
            setShowAddModal(false);
        }
    };

    const updateEvent = (id: string, field: string, value: string) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
        if (selectedEvent?.id === id) setSelectedEvent(prev => prev ? { ...prev, [field]: value } : null);
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        if (selectedEvent?.id === id) setSelectedEvent(null);
    };

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
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Filmagens</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Departamento / Trombiny Produções</p>
                </div>
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
                        {/* Controles do mês */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">←</button>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{MONTHS[currentMonthIdx]} {currentYear}</h3>
                                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">→</button>
                            </div>
                            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">+ Nova Filmagem</button>
                        </div>

                        {/* Calendário */}
                        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                                <div key={d} className="bg-[#0a0a0a] p-3 text-[9px] font-black uppercase text-gray-600 text-center">{d}</div>
                            ))}
                            {/* Células vazias antes do primeiro dia */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-[#080808] min-h-[90px] p-3 border-t border-r border-white/[0.03]" />
                            ))}
                            {/* Dias do mês */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const dayEvents = events.filter(e => e.date === dateStr);
                                const isToday = new Date().toISOString().startsWith(dateStr);
                                return (
                                    <div key={day} className={`bg-[#080808] min-h-[90px] p-2 border-t border-r border-white/[0.03] hover:bg-white/[0.02] transition-all ${isToday ? "ring-inset ring-1 ring-blue-500/30" : ""}`}>
                                        <span className={`text-[10px] font-black ${isToday ? "text-blue-400" : "text-gray-700"}`}>{day}</span>
                                        {dayEvents.map(e => (
                                            <div key={e.id} onClick={() => setSelectedEvent(e)} className="mt-1 p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-all">
                                                <p className="text-[8px] font-black text-white uppercase truncate">{e.title}</p>
                                                <p className="text-[7px] text-blue-300 uppercase font-bold truncate">{e.local} · {e.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Painel Lateral - Logística */}
                    <div className="space-y-6">
                        <div className="bg-[#0f0f0f] border border-white/[0.03] rounded-2xl p-6 sticky top-20">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 pb-3 border-b border-white/5">Logística de Set</h4>
                            {selectedEvent ? (
                                <div className="space-y-4 animate-fade-in">
                                    <input value={selectedEvent.title} onChange={e => updateEvent(selectedEvent.id, "title", e.target.value)} className="w-full bg-transparent text-lg font-black text-white uppercase outline-none" />
                                    <input value={selectedEvent.local} onChange={e => updateEvent(selectedEvent.id, "local", e.target.value)} placeholder="Local..." className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-blue-400 font-bold outline-none placeholder:text-gray-700" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="date" value={selectedEvent.date} onChange={e => updateEvent(selectedEvent.id, "date", e.target.value)} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-[10px] text-gray-300 outline-none" />
                                        <input type="time" value={selectedEvent.time} onChange={e => updateEvent(selectedEvent.id, "time", e.target.value)} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-[10px] text-gray-300 outline-none" />
                                    </div>
                                    <textarea value={selectedEvent.notes} onChange={e => updateEvent(selectedEvent.id, "notes", e.target.value)} placeholder="Observações do set..." rows={3} className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none placeholder:text-gray-700" />
                                    <button onClick={() => deleteEvent(selectedEvent.id)} className="w-full py-2 text-[9px] font-black uppercase text-red-500/50 hover:text-red-500 border border-red-500/10 hover:border-red-500/30 rounded-lg transition-all">Remover Evento</button>
                                </div>
                            ) : (
                                <div className="text-center py-12 opacity-20">
                                    <span className="text-3xl block mb-3">📅</span>
                                    <p className="text-[8px] font-black uppercase tracking-widest">Selecione um evento</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Adicionar */}
                    {showAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-black text-white uppercase">Nova Filmagem</h3>
                                <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Cliente / Show" className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600" />
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
                    <input type="file" ref={eqImageRef} onChange={handleEqImage} accept="image/*" className="hidden" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {equipments.map(eq => (
                            <div key={eq.id} className="bg-[#0f0f0f] border border-white/[0.03] rounded-2xl p-6 hover:border-white/10 transition-all group">
                                {/* Imagem */}
                                <div onClick={() => { setEditingEqId(eq.id); eqImageRef.current?.click(); }} className="w-full h-32 rounded-xl bg-white/[0.03] border border-dashed border-white/5 hover:border-white/15 flex items-center justify-center mb-4 cursor-pointer overflow-hidden transition-all">
                                    {eq.imageUrl ? (
                                        <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-gray-700 uppercase">+ Foto</span>
                                    )}
                                </div>
                                {/* Disponibilidade */}
                                <div className="flex justify-between items-start mb-3">
                                    <select value={eq.type} onChange={e => updateEquipment(eq.id, "type", e.target.value)} className="bg-transparent text-[9px] font-black text-gray-500 uppercase tracking-widest outline-none cursor-pointer">
                                        <option value="Câmera" className="bg-[#111]">Câmera</option>
                                        <option value="Lente" className="bg-[#111]">Lente</option>
                                        <option value="Áudio" className="bg-[#111]">Áudio</option>
                                        <option value="Iluminação" className="bg-[#111]">Iluminação</option>
                                        <option value="Outro" className="bg-[#111]">Outro</option>
                                    </select>
                                    <button onClick={() => updateEquipment(eq.id, "isAvailable", !eq.isAvailable)} className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border cursor-pointer ${eq.isAvailable ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                                        {eq.isAvailable ? "Disponível" : "Em Uso"}
                                    </button>
                                </div>
                                {/* Nome editável */}
                                <input value={eq.name} onChange={e => updateEquipment(eq.id, "name", e.target.value)} placeholder="Nome do equipamento..." className="w-full bg-transparent text-base font-black text-white uppercase outline-none placeholder:text-gray-700 mb-1" />
                                <input value={eq.specs || ""} onChange={e => updateEquipment(eq.id, "specs", e.target.value)} placeholder="Especificações..." className="w-full bg-transparent text-[10px] text-gray-500 font-bold outline-none placeholder:text-gray-700" />
                                {/* Excluir */}
                                <button onClick={() => deleteEquipment(eq.id)} className="mt-4 text-[8px] font-bold text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">Remover</button>
                            </div>
                        ))}
                        {/* Botão Adicionar */}
                        <button onClick={addEquipment} className="border border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center opacity-30 hover:opacity-100 transition-all cursor-pointer min-h-[200px]">
                            <span className="text-3xl mb-3">+</span>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Novo Equipamento</p>
                        </button>
                    </div>
                </div>
            )}

            {/* ============= DRIVE ============= */}
            {activeSection === "drive" && (
                <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-6">Pastas de filmagem no Google Drive</p>
                    {[
                        { client: "Afonso Padilha", path: "H:/Meu Drive/FILMAGENS/2025/06-JUNHO" },
                        { client: "4 Amigos", path: "H:/Meu Drive/FILMAGENS/2025/11-NOVEMBRO" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/[0.03] rounded-xl hover:border-white/10 transition-all group">
                            <span className="text-2xl">📂</span>
                            <div className="flex-1">
                                <p className="text-sm font-black text-white uppercase">{item.client}</p>
                                <code className="text-[9px] text-gray-600 font-mono">{item.path}</code>
                            </div>
                            <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Abrir Drive ➔</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
