import { useState, useEffect } from 'react';
import { Client, Equipment, ExpenseEntry } from './types';

export type DbData = {
    clients: Client[];
    inventory: Equipment[];
    uberExpenses: ExpenseEntry[];
};

export function useDb() {
    const [data, setData] = useState<DbData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const response = await fetch('/api/db');
            if (!response.ok) throw new Error('Falha ao carregar banco de dados');
            const json = await response.json();
            setData(json);
        } catch (err: any) {
            console.error('Failed to fetch DB:', err);
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveData = async (newData: DbData) => {
        try {
            const response = await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            if (response.ok) {
                setData(newData);
            }
        } catch (error) {
            console.error('Failed to save DB:', error);
        }
    };

    return { data, loading, error, saveData, refresh: fetchData };
}
