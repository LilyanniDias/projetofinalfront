// Onde: src/app/pages/ativos-list/ativos-list.component.ts

import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🚨 IMPORTANTE: Adicionado para usar [(ngModel)]
import { AtivosService, Ativo } from '../../../core/ativos/ativos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-ativos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink // ⬅️ Habilita a barra de pesquisa
  ],
  templateUrl: './ativos-list.html',
  styleUrls: ['./ativos-list.css']
})
export class AtivosListComponent {
  private authService = inject(AuthService);
  private userId: number | null = null;

  // Cache para armazenar quais ativos são favoritos
  public favoritosCache: Set<number> = new Set();

  // Verifica se o usuário está autenticado
  get isUserAuthenticated(): boolean {
    return this.authService.currentUser$ !== null && this.authService.currentUser$ !== undefined;
  }

  // Método para verificar se um ativo está nos favoritos
  isFavorito(ativo: Ativo): boolean {
      return this.favoritosCache.has(ativo.id);
  }

  // Método para alternar favorito
  toggleFavorito(ativo: Ativo): void {
      if (!this.isUserAuthenticated) {
          alert('Você precisa estar logado para favoritar ativos.');
          return;
      }

      // Ensure userId is properly initialized before using it
      if (this.userId === null) {
          alert('Erro: ID do usuário não está disponível. Tente novamente.');
          return;
      }

      if (this.isFavorito(ativo)) {
          // Remover do favorito
          this.ativosService.removeFavorito(this.userId!, ativo.id).subscribe({
              next: () => {
                  this.favoritosCache.delete(ativo.id);
              },
              error: (err) => {
                  console.error('Erro ao remover favorito:', err);
                  alert('Falha ao remover do favorito. Tente novamente.');
              }
          });
      } else {
          // Adicionar ao favorito
          console.log(ativo.id);
          
          this.ativosService.addFavorito(this.userId!, ativo.id).subscribe({
              next: () => {
                  this.favoritosCache.add(ativo.id);
              },
              error: (err) => {
                  console.error('Erro ao adicionar favorito:', err);
                  alert('Falha ao adicionar ao favorito. Tente novamente.');
              }
          });
      }
  }

  private ativosService = inject(AtivosService);

  // Clean up subscription on component destruction
  ngOnDestroy(): void {
    // No need to unsubscribe from currentUser$ as it's a BehaviorSubject
    // and will be automatically cleaned up when the component is destroyed
  }

  // Lista de ativos RAW (original, sem filtro)
  ativosRaw: WritableSignal<Ativo[]> = signal([]);
  
  // Lista de ativos que será exibida (filtrada)
  ativosFiltrados: WritableSignal<Ativo[]> = signal([]);

  // Sinal para armazenar o texto da barra de pesquisa
  searchTerm: WritableSignal<string> = signal('');

  errorMensagem: string | null = null;

  constructor() {
    this.carregarAtivos();
    // Initialize userId from the authenticated user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
      } else {
        this.userId = null;
      }
    });
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