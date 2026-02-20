"use client";

import { useState, useMemo } from "react";
import { useDb } from "../../lib/useDb";
import { ExpenseEntry } from "../../lib/types";

export default function FinancialPage() {
    const { data, loading, saveData } = useDb();
    const [activeEditor, setActiveEditor] = useState("Miguel");

    const editors = useMemo(() => {
        if (!data) return [];
        const set = new Set(data.uberExpenses.map(e => e.editor));
        return Array.from(set);
    }, [data]);

    if (loading || !data) return (
        <div className="flex items-center justify-center h-screen">
            <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Carregando Financeiro...</span>
        </div>
    );

    const filteredExpenses = activeEditor === "Todos" ? data.uberExpenses : data.uberExpenses.filter(e => e.editor === activeEditor);

    const addExpense = () => {
        const newData = { ...data };
        newData.uberExpenses.push({
            id: `ub-${Date.now()}`,
            date: new Date().toLocaleDateString("pt-BR"),
            show: "",
            local: "",
            ida: 0,
            volta: 0,
            editor: activeEditor === "Todos" ? (editors[0] || "Miguel") : activeEditor
        });
        saveData(newData);
    };

    const updateExpense = (id: string, updates: Partial<ExpenseEntry>) => {
        const newData = { ...data };
        newData.uberExpenses = newData.uberExpenses.map(e => e.id === id ? { ...e, ...updates } : e);
        saveData(newData);
    };

    const deleteExpense = (id: string) => {
        if (!confirm("Remover despesa?")) return;
        const newData = { ...data };
        newData.uberExpenses = newData.uberExpenses.filter(e => e.id !== id);
        saveData(newData);
    };

    const addEditor = () => {
        const name = prompt("Nome do editor:");
        if (name) {
            const newData = { ...data };
            newData.uberExpenses.push({
                id: `ub-${Date.now()}`,
                date: new Date().toLocaleDateString("pt-BR"),
                show: "Início",
                local: "-",
                ida: 0,
                volta: 0,
                editor: name
            });
            saveData(newData);
            setActiveEditor(name);
        }
    };

    const totalIda = filteredExpenses.reduce((acc, e) => acc + e.ida, 0);
    const totalVolta = filteredExpenses.reduce((acc, e) => acc + e.volta, 0);
    const totalGeral = totalIda + totalVolta;

    return (
        <div className="min-h-screen p-8 lg:p-12 bg-[#080808] animate-fade-in">
            <header className="mb-8">
                <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Financeiro</h2>
            </header>

            {/* Abas por Editor */}
            <div className="flex gap-2 mb-8 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5 w-fit items-center">
                {editors.map(editor => (
                    <button key={editor} onClick={() => setActiveEditor(editor)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeEditor === editor ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-300"}`}>
                        {editor}
                    </button>
                ))}
                <button onClick={() => setActiveEditor("Todos")} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeEditor === "Todos" ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-300"}`}>
                    Todos
                </button>
                <button onClick={addEditor} className="px-3 py-2.5 rounded-lg text-gray-700 hover:text-white text-xs transition-all">+</button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#0f0f0f] border border-white/[0.03] rounded-2xl p-6">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-3">Total Ida</p>
                    <p className="text-2xl font-black text-emerald-400">R$ {totalIda.toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="bg-[#0f0f0f] border border-white/[0.03] rounded-2xl p-6">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-3">Total Volta</p>
                    <p className="text-2xl font-black text-blue-400">R$ {totalVolta.toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-3">Total Reposição</p>
                    <p className="text-2xl font-black text-emerald-300">R$ {totalGeral.toFixed(2).replace(".", ",")}</p>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-px bg-white/5 border-b border-white/5">
                        {["Data", "Show / Gravação", "Local", "Editor", "Ida (R$)", "Volta (R$)", "⚙"].map(h => (
                            <div key={h} className="bg-[#0a0a0a] px-5 py-3 text-[8px] font-black text-gray-600 uppercase tracking-widest">{h}</div>
                        ))}
                    </div>

                    {filteredExpenses.map(expense => (
                        <div key={expense.id} className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-px bg-white/[0.02] border-b border-white/[0.03] hover:bg-white/[0.035] transition-all group">
                            <input value={expense.date} onChange={e => updateExpense(expense.id, { date: e.target.value })} placeholder="DD/MM/AAAA" className="bg-transparent px-5 py-3 text-xs font-bold text-gray-300 placeholder:text-gray-700 outline-none focus:bg-white/5 w-full" />
                            <input value={expense.show} onChange={e => updateExpense(expense.id, { show: e.target.value })} placeholder="Show ou gravação..." className="bg-transparent px-5 py-3 text-xs font-black text-white placeholder:text-gray-700 uppercase outline-none focus:bg-white/5 w-full" />
                            <input value={expense.local} onChange={e => updateExpense(expense.id, { local: e.target.value })} placeholder="Local..." className="bg-transparent px-5 py-3 text-xs font-bold text-gray-300 placeholder:text-gray-700 outline-none focus:bg-white/5 w-full" />
                            <input value={expense.editor} onChange={e => updateExpense(expense.id, { editor: e.target.value })} placeholder="Editor..." className="bg-transparent px-5 py-3 text-[10px] font-black text-gray-500 uppercase outline-none focus:bg-white/5 w-full" />
                            <input type="number" value={expense.ida} onChange={e => updateExpense(expense.id, { ida: parseFloat(e.target.value) || 0 })} className="bg-transparent px-5 py-3 text-xs font-bold text-emerald-400 outline-none focus:bg-white/5 w-full" />
                            <input type="number" value={expense.volta} onChange={e => updateExpense(expense.id, { volta: parseFloat(e.target.value) || 0 })} className="bg-transparent px-5 py-3 text-xs font-bold text-blue-400 outline-none focus:bg-white/5 w-full" />
                            <div className="flex items-center justify-center">
                                <button onClick={() => deleteExpense(expense.id)} className="text-gray-700 hover:text-red-500 text-xs transition-all opacity-0 group-hover:opacity-100 px-5 py-3">✕</button>
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-px border-t border-white/10 bg-white/[0.04]">
                        <div className="px-5 py-4 col-span-4"><span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total Acumulado</span></div>
                        <div className="px-5 py-4"><span className="text-sm font-black text-emerald-400">R$ {totalIda.toFixed(2).replace(".", ",")}</span></div>
                        <div className="px-5 py-4"><span className="text-sm font-black text-blue-400">R$ {totalVolta.toFixed(2).replace(".", ",")}</span></div>
                        <div className="px-5 py-4" />
                    </div>
                </div>
            </div>

            <button onClick={addExpense} className="mt-3 w-full py-3 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-white border border-dashed border-white/5 hover:border-white/10 rounded-xl transition-all">+ Adicionar Linha</button>
        </div>
    );
}
