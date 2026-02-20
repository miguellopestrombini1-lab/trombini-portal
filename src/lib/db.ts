import { Client, Equipment, Location } from "./types";

// =============================================
// BANCO DE DADOS DE CLIENTES
// Referência: Afonso Padilha e 4 Amigos (pilotos)
// =============================================
export const clients: Client[] = [
    {
        id: "afonso",
        name: "Afonso Padilha",
        contact: {
            instagram: "@afonsopadilha",
            phone: "11 XXXXX-XXXX"
        },
        frequency: "Semanal",
        reelsQuantity: 4,
        paymentAmount: 2000,
        editorId: "miguel",
        premiereTemplate: "OneDrive/MODELOS/AFONSO_REELS_2026.prproj",
        projects: [
            // --- Filmagens (Brutos no Google Drive) ---
            { id: "af-film-1", name: "19_CURITIBA", year: 2025, month: "Junho", status: "Entregue", type: "raw", path: "H:/Meu Drive/FILMAGENS/2025/06-JUNHO/19.06.2025-CURITIBA" },
            { id: "af-film-2", name: "20_GUARULHOS", year: 2025, month: "Junho", status: "Entregue", type: "raw", path: "H:/Meu Drive/FILMAGENS/2025/06-JUNHO/20.06.2025-GUARULHOS" },
            // --- Edições (OneDrive) ---
            { id: "af-edit-1", name: "CARNAVAL CHEGAR CEDO", year: 2026, month: "Fevereiro", status: "Em edição", type: "reels", path: "OneDrive/REELS GERAL/AFONSO/2026/02-FEVEREIRO" },
            { id: "af-edit-2", name: "MEDITAÇÃO", year: 2026, month: "Fevereiro", status: "Atrasado", type: "reels", path: "OneDrive/REELS GERAL/AFONSO/2026/02-FEVEREIRO" },
            { id: "af-edit-3", name: "IR PRO MATO CARNAVAL", year: 2026, month: "Fevereiro", status: "Entregue", type: "reels", deliveredAt: "15/02/2026", path: "OneDrive/REELS GERAL/AFONSO/2026/02-FEVEREIRO" },
        ]
    },
    {
        id: "quatro",
        name: "4 Amigos",
        contact: {
            instagram: "@4amigos",
            phone: "11 YYYYY-YYYY"
        },
        frequency: "Mensal (Especial)",
        reelsQuantity: 8,
        paymentAmount: 4000,
        editorId: "diogo",
        premiereTemplate: "OneDrive/MODELOS/4AMIGOS_REELS_2025.prproj",
        projects: [
            // --- Filmagens ---
            { id: "q-film-1", name: "09.11.2025 - FLORIPA", year: 2025, month: "Novembro", status: "Entregue", type: "raw", path: "H:/Meu Drive/FILMAGENS/2025/11-NOVEMBRO/09.11.2025-FLORIPA" },
            { id: "q-film-2", name: "10.11.2025 - SÃO JOSÉ", year: 2025, month: "Novembro", status: "Entregue", type: "raw", path: "H:/Meu Drive/FILMAGENS/2025/11-NOVEMBRO/10.11.2025-SAO-JOSE" },
            // --- Edições ---
            { id: "q-edit-1", name: "9 A CADA 10 DENTISTAS", year: 2025, month: "Novembro", status: "Entregue", type: "reels", deliveredAt: "20/11/2025", path: "OneDrive/REELS GERAL/4 AMIGOS/2025/11-NOVEMBRO" },
            { id: "q-edit-2", name: "BANHEIRO", year: 2025, month: "Novembro", status: "Entregue", type: "reels", deliveredAt: "22/11/2025", path: "OneDrive/REELS GERAL/4 AMIGOS/2025/11-NOVEMBRO" },
        ]
    },
    {
        id: "serie-b",
        name: "Série B",
        contact: { instagram: "@serieb", phone: "" },
        frequency: "Semanal",
        reelsQuantity: 0,
        paymentAmount: 0,
        editorId: "miguel",
        premiereTemplate: "",
        projects: []
    }
];

// =============================================
// BANCO DE DADOS DE EQUIPAMENTOS
// Equipamentos reais da Trombiny Produções
// =============================================
export const inventory: Equipment[] = [
    // --- Câmeras ---
    { id: "cam1", name: "Canon EOS 90D #1", type: "Câmera", isAvailable: true, specs: "4K, 32.5MP" },
    { id: "cam2", name: "Canon EOS 90D #2", type: "Câmera", isAvailable: true, specs: "4K, 32.5MP" },
    // --- Lentes ---
    { id: "len1", name: "Canon 24-105mm L #1", type: "Lente", isAvailable: true, specs: "f/4 IS USM" },
    { id: "len2", name: "Canon 24-105mm L #2", type: "Lente", isAvailable: true, specs: "f/4 IS USM" },
    { id: "len3", name: "Canon 75-300mm #1", type: "Lente", isAvailable: true, specs: "f/4-5.6 III" },
    { id: "len4", name: "Canon 75-300mm #2", type: "Lente", isAvailable: true, specs: "f/4-5.6 III" },
    // --- Áudio ---
    { id: "aud1", name: "Zoom H6", type: "Áudio", isAvailable: true, specs: "Gravador de Campo Multi-track" },
    { id: "aud2", name: "Zoom H5", type: "Áudio", isAvailable: true, specs: "Gravador Compacto" },
];

// =============================================
// BANCO DE DADOS DE LOCAIS
// Configure kits recomendados por local
// =============================================
export const locations: Location[] = [
    {
        id: "teatro-grande",
        name: "Teatro Grande",
        size: "Grande",
        recommendedKit: ["cam1", "cam2", "len3", "len4", "aud1"] // 2 câmeras + teleobjetiva + H6
    },
    {
        id: "teatro-medio",
        name: "Teatro Médio",
        size: "Médio",
        recommendedKit: ["cam1", "len1", "aud1"] // 1 câmera + 24-105 + H6
    },
    {
        id: "estudio",
        name: "Estúdio / Config Fechada",
        size: "Pequeno",
        recommendedKit: ["cam1", "len1", "aud2"] // 1 câmera + 24-105 + H5
    }
];

// =============================================
// BANCO DE DADOS FINANCEIRO - UBER
// Estrutura baseada na planilha "MIGUEL UBER"
// =============================================
export type ExpenseEntry = {
    id: string;
    date: string;
    show: string;
    local: string;
    ida: number;
    volta: number;
    editor: string;
};

export const uberExpenses: ExpenseEntry[] = [
    { id: "ub1", date: "06/06/2025", show: "After Comedy", local: "Renaiscence", ida: 0, volta: 0, editor: "Miguel" },
    { id: "ub2", date: "07/06/2025", show: "Afonso Padilha (2 Sessões)", local: "Mauá", ida: 17.99, volta: 81.69, editor: "Miguel" },
    { id: "ub3", date: "13/06/2025", show: "After Comedy", local: "Renaiscence", ida: 0, volta: 0, editor: "Miguel" },
    { id: "ub4", date: "20/06/2025", show: "Afonso Padilha (2 Sessões)", local: "Guarulhos", ida: 13.99, volta: 61.98, editor: "Miguel" },
    { id: "ub5", date: "21/06/2025", show: "After Comedy", local: "Renaiscence", ida: 0, volta: 0, editor: "Miguel" },
    { id: "ub6", date: "27/06/2025", show: "4 Amigos", local: "Jundiaí", ida: 73.37, volta: 100.57, editor: "Miguel" },
];
