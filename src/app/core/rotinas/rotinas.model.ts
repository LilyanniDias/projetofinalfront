// Define os 5 slots/categorias fixos que o usuário irá preencher
export type RotinaSlotName = 'Limpeza' | 'Tratamento' | 'Hidratação' | 'Proteção' | 'Extra';

// A estrutura do Ativo que será enviada/salva na rotina
export interface AtivoRotina {
    id_ativo: number;           // ID do ativo (do AtivosService)
    nome: string;               // Nome do ativo (ex: Vitamina C)
    funcao_principal: string;   // Função principal (ex: Antioxidante)
    passo: RotinaSlotName;      // A qual slot fixo ele pertence (ex: 'Tratamento')
}

// O objeto que o Creator Componente prepara para enviar ao Serviço/Backend
export interface RotinaPayload {
    nome: string;
    ativos: AtivoRotina[];
}

// O objeto completo que o Serviço/Backend retorna após salvar
export interface Rotina {
    id?: number;              // ID gerado
    nome: string;
    usuario_id?: number;      // ID do usuário
    data_criacao?: string;    // Data de criação
    ativos: AtivoRotina[];
}

// Estrutura interna para o Componente Creator gerenciar os 5 slots
export interface RotinaSlot {
    category: RotinaSlotName;
    ativo: AtivoRotina | null; // Pode ter um AtivoRotina ou ser nulo
    ordem_fixa: number;        // 1, 2, 3, 4, 5
}