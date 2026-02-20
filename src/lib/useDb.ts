import { useState, useEffect } from 'react';
import { Client, Equipment, Project, ExpenseEntry } from './types';

export type DbData = {
    clients: Client[];
    inventory: Equipment[];
    uberExpenses: ExpenseEntry[];
};

export function useDb() {
    const [data, setData] = useState<DbData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/db');
            const json = await response.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch DB:', error);
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

    return { data, loading, saveData, refresh: fetchData };
}
