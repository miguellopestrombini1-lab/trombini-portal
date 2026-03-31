export type Status = "Atrasado" | "Aguardando" | "Em edição" | "Entregue";

export type ProjectType = "reels" | "youtube" | "raw";

export type EditorId = "miguel" | "diogo";

export type Project = {
    id: string;
    name: string;
    year: number;
    month?: string;
    status: Status;
    type: ProjectType;
    path?: string; // Caminho no Drive/OneDrive
    deliveredAt?: string; // Data de entrega, ex: "15/02/2026"
    scheduledDate?: string; // Data programada para a agenda (YYYY-MM-DD)
    location?: string;
    time?: string;
    notes?: string;
    equipmentIds?: string[];
};

export type Client = {
    id: string;
    name: string;
    contact?: {
        phone?: string;
        instagram?: string;
        email?: string;
    };
    category?: string; // Ex: "Standup", "Podcast"
    reelsQuantity?: number; // Qtd de reels por mês/contrato
    frequency?: string; // Ex: "2 por semana"
    paymentAmount?: number; // Valor pago
    editorId: EditorId; // ID do editor responsável
    premiereTemplate?: string; // Caminho para o template .prproj
    projects: Project[];
};

export type EquipmentType = "Câmera" | "Lente" | "Áudio" | "Iluminação" | "Outro";

export type Equipment = {
    id: string;
    name: string;
    type: EquipmentType;
    specs?: string;
    isAvailable: boolean;
};

export type Location = {
    id: string;
    name: string;
    size: "Pequeno" | "Médio" | "Grande";
    recommendedKit?: string[]; // IDs de equipamentos
};

export type ExpenseEntry = {
    id: string;
    date: string;
    show: string;
    local: string;
    ida: number;
    volta: number;
    editor: string;
};
