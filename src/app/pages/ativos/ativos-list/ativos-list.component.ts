// Onde: src/app/pages/ativos-list/ativos-list.component.ts

import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🚨 IMPORTANTE: Adicionado para usar [(ngModel)]
import { AtivosService, Ativo } from '../../../core/ativos/ativos.service';

@Component({
  selector: 'app-ativos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // ⬅️ Habilita a barra de pesquisa
  ],
  templateUrl: './ativos-list.html',
  styleUrls: ['./ativos-list.css']
})
export class AtivosListComponent {

  private ativosService = inject(AtivosService);

  // Lista de ativos RAW (original, sem filtro)
  ativosRaw: WritableSignal<Ativo[]> = signal([]);
  
  // Lista de ativos que será exibida (filtrada)
  ativosFiltrados: WritableSignal<Ativo[]> = signal([]);

  // Sinal para armazenar o texto da barra de pesquisa
  searchTerm: WritableSignal<string> = signal(''); 

  errorMensagem: string | null = null;

  constructor() {
    this.carregarAtivos();
  }

  carregarAtivos(): void {
    this.errorMensagem = null;

    this.ativosService.getAtivos().subscribe({
      next: (data) => {
        this.ativosRaw.set(data);
        this.filtrarAtivos(); // ⬅️ Filtra inicialmente para exibir todos os dados
      },
      error: (err) => {
        console.error('Erro ao carregar ativos:', err);
        this.errorMensagem = 'Falha ao conectar com o Backend (Node.js/MySQL). Verifique o console do servidor.';
      }
    });
  }

  /**
   * Função que é chamada sempre que o searchTerm (barra de pesquisa) é alterado.
   */
  filtrarAtivos(): void {
    const term = this.searchTerm().toLowerCase().trim();
    const rawData = this.ativosRaw();

    if (!term) {
      // Se a pesquisa estiver vazia, exibe todos os dados originais.
      this.ativosFiltrados.set(rawData);
      return;
    }

    // Filtra a lista original
    const resultado = rawData.filter(ativo => {
      // Procura o termo em diversas colunas (Nome, Função Principal, Origem)
      return (
        ativo.nome.toLowerCase().includes(term) ||
        ativo.funcao_principal.toLowerCase().includes(term) ||
        ativo.origem_geografica.toLowerCase().includes(term) ||
        ativo.tipo_de_pele_indicada.toLowerCase().includes(term)
      );
    });

    this.ativosFiltrados.set(resultado);
  }
}