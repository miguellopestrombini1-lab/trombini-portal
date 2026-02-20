"use client";

import { useState, useRef, useEffect } from "react";
import { useDb, DbData } from "../../lib/useDb";
import { Client, Project, Status, EditorId } from "../../lib/types";

// Tipo local de edição (Reels / YouTube apenas)
type EditItem = {
    id: string;
    name: string;
    type: "reels" | "youtube";
    status: Status;
    delivered: boolean;
    deliveryDate: string;
    link: string;
    fileUrl: string;
    fileName: string;
    notes: string;
};

function EditionsTab({ projects, onUpdate }: { projects: Project[], onUpdate: (projects: Project[]) => void }) {
    const [items, setItems] = useState<EditItem[]>(
        projects.filter(p => p.type !== "raw").map(p => ({
            id: p.id, name: p.name, type: (p.type === "youtube" ? "youtube" : "reels") as "reels" | "youtube",
            status: p.status, delivered: p.status === "Entregue", deliveryDate: p.deliveredAt || "",
            link: "", fileUrl: "", fileName: "", notes: "",
        }))
    );
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

    const update = (id: string, field: keyof EditItem, value: string | boolean | undefined) => {
        const newItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
        setItems(newItems);
        syncProjects(newItems);
    };

    const toggleDelivered = (id: string) => {
        const newItems = items.map(item =>
            item.id === id
                ? { ...item, delivered: !item.delivered, status: (!item.delivered ? "Entregue" : "Aguardando") as Status, deliveryDate: !item.delivered ? new Date().toLocaleDateString("pt-BR") : "" }
                : item
        );
        setItems(newItems);
        syncProjects(newItems);
    };

    const deleteItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        syncProjects(newItems);
    };

    const addItem = () => {
        // eslint-disable-next-line react-hooks/purity
        const newItem: EditItem = { id: `edit-${Date.now()}`, name: "", type: "reels", status: "Aguardando", delivered: false, deliveryDate: "", link: "", fileUrl: "", fileName: "", notes: "" };
        const newItems = [...items, newItem];
        setItems(newItems);
        setExpandedId(newItem.id);
        syncProjects(newItems);
    };

    const syncProjects = (currentItems: EditItem[]) => {
        const rawProjects = projects.filter(p => p.type === "raw");
        const updatedEditions = currentItems.map(item => ({
            id: item.id,
            name: item.name,
            year: new Date().getFullYear(),
            status: item.status,
            type: item.type as "reels" | "youtube",
            deliveredAt: item.deliveryDate
        }));
        onUpdate([...rawProjects, ...updatedEditions]);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadTargetId) {
            const url = URL.createObjectURL(file);
            update(uploadTargetId, "fileUrl", url);
            update(uploadTargetId, "fileName", file.name);
        }
    };

    const typeColor: Record<string, string> = {
        reels: "text-pink-400 bg-pink-400/10 border-pink-400/20",
        youtube: "text-red-400 bg-red-400/10 border-red-400/20",
    };

    return (
        <div className="space-y-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*,.mp4,.mov,.avi" className="hidden" />

            <div className="grid grid-cols-[2fr_0.7fr_0.6fr_1fr_1fr_0.3fr] gap-3 px-5 py-3 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                <span>Projeto</span><span className="text-center">Tipo</span><span className="text-center">✓</span><span className="text-center">Data Entrega</span><span className="text-center">Arquivo</span><span className="text-center">⚙</span>
            </div>

            {items.map(item => (
                <div key={item.id}>
                    <div className={`grid grid-cols-[2fr_0.7fr_0.6fr_1fr_1fr_0.3fr] gap-3 items-center px-5 py-3 rounded-xl border transition-all ${item.delivered ? "bg-emerald-500/[0.03] border-emerald-500/10" : "bg-white/[0.02] border-white/[0.03] hover:border-white/10"}`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.delivered ? "bg-emerald-500" : "bg-amber-400"}`} />
                            <input value={item.name} onChange={e => update(item.id, "name", e.target.value)} placeholder="Nome do projeto..." className={`bg-transparent text-xs font-black uppercase outline-none w-full ${item.delivered ? "text-gray-500 line-through" : "text-white"} placeholder:text-gray-700`} />
                        </div>
                        <div className="flex justify-center">
                            <select value={item.type} onChange={e => update(item.id, "type", e.target.value)} className={`bg-transparent text-center text-[8px] font-black uppercase px-2 py-1 rounded-lg border outline-none cursor-pointer ${typeColor[item.type]}`}>
                                <option value="reels" className="bg-[#111] text-white">Reels</option>
                                <option value="youtube" className="bg-[#111] text-white">YouTube</option>
                            </select>
                        </div>
                        <div className="flex justify-center">
                            <button onClick={() => toggleDelivered(item.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.delivered ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 hover:border-white/30"}`}>
                                {item.delivered && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                            </button>
                        </div>
                        <input type="text" placeholder="DD/MM/AAAA" value={item.deliveryDate} onChange={e => update(item.id, "deliveryDate", e.target.value)} className="bg-transparent border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-center text-gray-300 placeholder:text-gray-700 outline-none" />
                        <div className="flex justify-center">
                            <button onClick={() => { setUploadTargetId(item.id); setExpandedId(expandedId === item.id ? null : item.id); }} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase text-gray-400 hover:text-white transition-all">
                                {item.fileName ? "📎 " + item.fileName.substring(0, 12) : "+ Arquivo"}
                            </button>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-700 hover:text-red-500 transition-all text-xs text-center">✕</button>
                    </div>

                    {expandedId === item.id && (
                        <div className="ml-6 mt-1 mb-3 p-5 bg-white/[0.015] border border-white/[0.04] rounded-xl space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Link (URL)</label>
                                    <input type="url" value={item.link} onChange={e => update(item.id, "link", e.target.value)} placeholder="https://drive.google.com/..." className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-700 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Upload de Arquivo</label>
                                    <button onClick={() => { setUploadTargetId(item.id); fileInputRef.current?.click(); }} className="w-full bg-white/[0.03] border border-dashed border-white/10 hover:border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-500 hover:text-white transition-all text-left">
                                        {item.fileName || "Clique para fazer upload..."}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Observações</label>
                                <textarea value={item.notes} onChange={e => update(item.id, "notes", e.target.value)} placeholder="Anotações..." rows={2} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-700 outline-none resize-none" />
                            </div>
                            {/* Player de Vídeo */}
                            {item.fileUrl && (
                                <div>
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Preview</label>
                                    <video controls src={item.fileUrl} className="w-full rounded-xl border border-white/5 bg-black max-h-[300px]" />
                                </div>
                            )}
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest">🔗 Abrir Link ➔</a>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <button onClick={addItem} className="w-full mt-3 py-3 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-white border border-dashed border-white/5 hover:border-white/10 rounded-xl transition-all">
                + Adicionar Projeto
            </button>
        </div>
    );
}

function FilmagensTab({ projects, onUpdate }: { projects: Project[], onUpdate: (projects: Project[]) => void }) {
    const [items, setItems] = useState(projects.filter(p => p.type === "raw").map(p => ({ ...p })));

    const update = (id: string, field: string, value: string | number | undefined) => {
        const newItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
        setItems(newItems);
        syncProjects(newItems);
    };

    const deleteItem = (id: string) => {
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        syncProjects(newItems);
    };

    const addItem = () => {
        // eslint-disable-next-line react-hooks/purity
        const newItems = [...items, { id: `film-${Date.now()}`, name: "", year: new Date().getFullYear(), month: "", status: "Aguardando" as Status, type: "raw" as const, path: "" }];
        setItems(newItems);
        syncProjects(newItems);
    };

    const syncProjects = (currentItems: Project[]) => {
        const editionProjects = projects.filter(p => p.type !== "raw");
        onUpdate([...editionProjects, ...currentItems]);
    };

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="group p-5 bg-white/[0.02] border border-white/[0.03] rounded-xl hover:border-white/10 transition-all">
                    <div className="flex gap-3 items-center">
                        <span className="text-lg">📁</span>
                        <input value={item.name} onChange={e => update(item.id, "name", e.target.value)} placeholder="Nome (ex: 19.06 - CURITIBA)" className="flex-1 bg-transparent text-xs font-black text-white uppercase outline-none placeholder:text-gray-700" />
                        <input value={item.month || ""} onChange={e => update(item.id, "month", e.target.value)} placeholder="Mês" className="w-24 bg-transparent border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-400 outline-none text-center placeholder:text-gray-700" />
                        <input type="number" value={item.year} onChange={e => update(item.id, "year", parseInt(e.target.value) || 2026)} className="w-16 bg-transparent border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-400 outline-none text-center" />
                        <button onClick={() => deleteItem(item.id)} className="text-gray-700 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-all">✕</button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <input value={item.path || ""} onChange={e => update(item.id, "path", e.target.value)} placeholder="Caminho do Drive..." className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-gray-500 outline-none placeholder:text-gray-700" />
                        {item.path && <a href={item.path.startsWith("http") ? item.path : `https://drive.google.com`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase whitespace-nowrap">Abrir ➔</a>}
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="w-full py-3 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-white border border-dashed border-white/5 hover:border-white/10 rounded-xl transition-all">+ Adicionar Filmagem</button>
        </div>
    );
}

// =====================================================
// PÁGINA DE CLIENTES
// =====================================================
export default function ClientesPage() {
    const { data, loading, saveData } = useDb();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<"filmagens" | "edicoes" | "contrato">("filmagens");
    const [clientImages, setClientImages] = useState<Record<string, string>>({});
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);

    const updateClient = (updatedClient: Client) => {
        if (!data) return;
        const newClients = data.clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        saveData({ ...data, clients: newClients });
        setSelectedClient(updatedClient);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingClientId) {
            const url = URL.createObjectURL(file);
            setClientImages(prev => ({ ...prev, [editingClientId]: url }));
        }
    };

    const addClient = () => {
        if (!data) return;
        const newClient: Client = {
            id: `client-${Date.now()}`,
            name: "Novo Cliente",
            editorId: "miguel",
            projects: [],
        };
        saveData({ ...data, clients: [...data.clients, newClient] });
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Carregando Banco de Dados...</span></div>;

    // Tela inteira do cliente
    if (selectedClient) {
        return (
            <div className="min-h-screen bg-[#080808] animate-fade-in">
                {/* Top Bar */}
                <div className="sticky top-0 z-10 bg-[#080808]/95 backdrop-blur-xl border-b border-white/5 px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                            Clientes
                        </button>
                        <span className="text-gray-700">/</span>
                        <span className="text-xs font-black text-white uppercase">{selectedClient.name}</span>
                    </div>
                </div>

                {/* Perfil */}
                <div className="px-8 lg:px-16 pt-10 pb-6">
                    <div className="flex items-center gap-8">
                        <div
                            onClick={() => { setEditingClientId(selectedClient.id); imageInputRef.current?.click(); }}
                            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent flex items-center justify-center text-4xl cursor-pointer overflow-hidden hover:ring-2 hover:ring-white/10 transition-all group"
                        >
                            {clientImages[selectedClient.id] ? (
                                <img src={clientImages[selectedClient.id]} alt={selectedClient.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="group-hover:scale-110 transition-transform">👤</span>
                            )}
                        </div>
                        <div>
                            <input
                                value={selectedClient.name}
                                onChange={e => updateClient({ ...selectedClient, name: e.target.value })}
                                className="text-5xl font-black text-white tracking-tighter leading-none bg-transparent outline-none uppercase"
                            />
                            <div className="flex items-center gap-4 mt-2 font-bold uppercase tracking-widest">
                                <span className="text-[10px] text-gray-600">{selectedClient.projects.length} projetos</span>
                                <span className="text-[10px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg">{selectedClient.category || "Sem Categoria"}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg ${selectedClient.editorId === 'miguel' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    Editor: {selectedClient.editorId}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="sticky top-[53px] z-10 bg-[#080808] border-b border-white/5 px-8 lg:px-16">
                    <div className="flex gap-8">
                        {(["filmagens", "edicoes", "contrato"] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? "text-white border-white" : "text-gray-600 border-transparent"}`}>
                                {tab === "filmagens" ? "📁 Filmagens" : tab === "edicoes" ? "🎬 Edições" : "📄 Dados do Cliente"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="px-8 lg:px-16 py-8">
                    {activeTab === "filmagens" && <FilmagensTab projects={selectedClient.projects} onUpdate={(p) => updateClient({ ...selectedClient, projects: p })} />}
                    {activeTab === "edicoes" && <EditionsTab projects={selectedClient.projects} onUpdate={(p) => updateClient({ ...selectedClient, projects: p })} />}
                    {activeTab === "contrato" && (
                        <div className="max-w-2xl bg-[#0f0f0f] border border-white/[0.03] rounded-3xl p-10 space-y-8 animate-fade-in">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Configurações de Contrato e Editor</h4>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Categoria</label>
                                    <input value={selectedClient.category || ""} onChange={e => updateClient({ ...selectedClient, category: e.target.value })} placeholder="Ex: Standup, Podcast..." className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Editor Responsável</label>
                                    <select value={selectedClient.editorId} onChange={e => updateClient({ ...selectedClient, editorId: e.target.value as EditorId })} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none cursor-pointer">
                                        <option value="miguel" className="bg-[#111]">MIGUEL</option>
                                        <option value="diogo" className="bg-[#111]">DIOGO</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Reels p/ Mês</label>
                                    <input type="number" value={selectedClient.reelsQuantity || 0} onChange={e => updateClient({ ...selectedClient, reelsQuantity: parseInt(e.target.value) || 0 })} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Frequência</label>
                                    <input value={selectedClient.frequency || ""} onChange={e => updateClient({ ...selectedClient, frequency: e.target.value })} placeholder="Ex: 2 por semana" className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Pagamento (R$)</label>
                                    <input type="number" value={selectedClient.paymentAmount || 0} onChange={e => updateClient({ ...selectedClient, paymentAmount: parseFloat(e.target.value) || 0 })} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-relaxed">
                                        💡 Ao alterar o editor, todos os projetos pendentes deste cliente serão migrados automaticamente para a agenda do novo responsável.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 lg:p-12 bg-[#080808] animate-fade-in">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Clientes</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Banco de Dados Operacional</p>
                </div>
                <button onClick={addClient} className="bg-white/5 hover:bg-white/10 border border-white/5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">+ Novo Cliente</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.clients.map(client => (
                    <div
                        key={client.id}
                        onClick={() => { setSelectedClient(client); setActiveTab("filmagens"); }}
                        className="group cursor-pointer bg-[#0f0f0f] border border-white/[0.03] hover:border-white/10 rounded-3xl p-8 transition-all duration-500 hover:bg-[#121212] flex flex-col items-center text-center relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-1 h-full ${client.editorId === 'miguel' ? 'bg-amber-500/30' : 'bg-purple-500/30'}`} />
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent flex items-center justify-center text-3xl mb-5 overflow-hidden group-hover:scale-105 transition-transform">
                            {clientImages[client.id] ? (
                                <img src={clientImages[client.id]} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tighter group-hover:text-amber-400 transition-all uppercase">{client.name}</h3>
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold mt-1">{client.category || "Geral"}</p>
                        <div className="mt-4 flex gap-2">
                            <span className="text-[7px] font-black border border-white/5 px-2 py-1 rounded bg-white/[0.02] text-gray-500 uppercase">{client.editorId}</span>
                            <span className="text-[7px] font-black border border-white/5 px-2 py-1 rounded bg-white/[0.02] text-gray-500 uppercase">{client.projects.length} PRJ</span>
                        </div>
                    </div>
                ))}
            </div>

            <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>
    );
}
