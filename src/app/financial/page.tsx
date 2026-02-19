"use client";

import { useState } from "react";
import { uberExpenses as initialExpenses, ExpenseEntry } from "../../lib/db";

export default function FinancialPage() {
    const [activeEditor, setActiveEditor] = useState("Miguel");
    const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);

    // Editores únicos
    const editors = [...new Set(expenses.map(e => e.editor))];

    const filteredExpenses = activeEditor === "Todos" ? expenses : expenses.filter(e => e.editor === activeEditor);

    const addExpense = () => {
        setExpenses(prev => [...prev, { id: `ub-${Date.now()}`, date: "", show: "", local: "", ida: 0, volta: 0, editor: activeEditor === "Todos" ? "Miguel" : activeEditor }]);
    };

    const updateExpense = (id: string, field: keyof ExpenseEntry, value: string | number) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

    const addEditor = () => {
        const name = prompt("Nome do editor:");
        if (name) {
            setExpenses(prev => [...prev, { id: `ub-${Date.now()}`, date: "", show: "", local: "", ida: 0, volta: 0, editor: name }]);
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
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Reposição de Uber · Por Editor / Trombiny Produções</p>
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
            <div className="grid grid-cols-3 gap-4 mb-8">
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
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_0.5fr] gap-px bg-white/5 border-b border-white/5">
                    {["Data", "Show / Gravação", "Local", "Ida (R$)", "Volta (R$)", "⚙"].map(h => (
                        <div key={h} className="bg-[#0a0a0a] px-5 py-3 text-[8px] font-black text-gray-600 uppercase tracking-widest">{h}</div>
                    ))}
                </div>

                {filteredExpenses.map(expense => (
                    <div key={expense.id} className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_0.5fr] gap-px bg-white/[0.02] border-b border-white/[0.03] hover:bg-white/[0.035] transition-all group">
                        <input value={expense.date} onChange={e => updateExpense(expense.id, "date", e.target.value)} placeholder="DD/MM/AAAA" className="bg-transparent px-5 py-3 text-xs font-bold text-gray-300 placeholder:text-gray-700 outline-none focus:bg-white/5" />
                        <input value={expense.show} onChange={e => updateExpense(expense.id, "show", e.target.value)} placeholder="Show ou gravação..." className="bg-transparent px-5 py-3 text-xs font-black text-white placeholder:text-gray-700 uppercase outline-none focus:bg-white/5" />
                        <input value={expense.local} onChange={e => updateExpense(expense.id, "local", e.target.value)} placeholder="Local..." className="bg-transparent px-5 py-3 text-xs font-bold text-gray-300 placeholder:text-gray-700 outline-none focus:bg-white/5" />
                        <input type="number" value={expense.ida} onChange={e => updateExpense(expense.id, "ida", parseFloat(e.target.value) || 0)} className="bg-transparent px-5 py-3 text-xs font-bold text-emerald-400 outline-none focus:bg-white/5" />
                        <input type="number" value={expense.volta} onChange={e => updateExpense(expense.id, "volta", parseFloat(e.target.value) || 0)} className="bg-transparent px-5 py-3 text-xs font-bold text-blue-400 outline-none focus:bg-white/5" />
                        <button onClick={() => deleteExpense(expense.id)} className="text-gray-700 hover:text-red-500 text-xs transition-all opacity-0 group-hover:opacity-100 px-5 py-3">✕</button>
                    </div>
                ))}

                <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_0.5fr] gap-px border-t border-white/10 bg-white/[0.04]">
                    <div className="px-5 py-4 col-span-3"><span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total</span></div>
                    <div className="px-5 py-4"><span className="text-sm font-black text-emerald-400">R$ {totalIda.toFixed(2).replace(".", ",")}</span></div>
                    <div className="px-5 py-4"><span className="text-sm font-black text-blue-400">R$ {totalVolta.toFixed(2).replace(".", ",")}</span></div>
                    <div className="px-5 py-4" />
                </div>
            </div>

            <button onClick={addExpense} className="mt-3 w-full py-3 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-white border border-dashed border-white/5 hover:border-white/10 rounded-xl transition-all">+ Adicionar Linha</button>
        </div>
    );
}
