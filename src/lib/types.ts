export type Status = "Atrasado" | "Aguardando" | "Em edição" | "Entregue";

export type ProjectType = "reels" | "youtube" | "raw";

export type Project = {
    id: string;
    name: string;
    year: number;
    month?: string;
    status: Status;
    type: ProjectType;
    path?: string; // Caminho no Drive/OneDrive
    deliveredAt?: string; // Data de entrega, ex: "15/02/2026"
};

export type Client = {
    id: string;
    name: string;
    contact?: {
        phone?: string;
        instagram?: string;
        email?: string;
    };
    frequency?: string; // Ex: "2 por mês"
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
