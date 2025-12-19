import { Component, OnInit, WritableSignal, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AtivosService, Ativo } from '../../../core/ativos/ativos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-ativos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ativos-list.html',
  styleUrls: ['./ativos-list.css']
})
export class AtivosListComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private ativosService = inject(AtivosService);
  private userId: number | null = null;

  // AGORA É UM SIGNAL: O segredo para matar o bug de reatividade
  public favoritosCache = signal<Set<number>>(new Set());

  ativosRaw: WritableSignal<Ativo[]> = signal([]);
  ativosFiltrados: WritableSignal<Ativo[]> = signal([]);
  searchTerm: WritableSignal<string> = signal('');
  errorMensagem: string | null = null;

  constructor() {
    this.carregarAtivos();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.carregarFavoritosDoUsuario();
      } else {
        this.userId = null;
        this.favoritosCache.set(new Set());
      }
    });
  }

  carregarFavoritosDoUsuario(): void {
    if (!this.userId) return;
    this.ativosService.getFavoritos(this.userId).subscribe({
      next: (favs) => {
        const novoSet = new Set<number>();
        favs.forEach(f => novoSet.add(f.id));
        this.favoritosCache.set(novoSet); // Atualiza o signal
      }
    });
  }

  // Função isFavorito agora lê o valor do signal
  isFavorito(ativo: Ativo): boolean {
      return this.favoritosCache().has(ativo.id);
  }

  toggleFavorito(ativo: Ativo): void {
      if (!this.userId) return;

      const id = ativo.id;
      const jaEFavorito = this.isFavorito(ativo);

      if (jaEFavorito) {
          this.ativosService.removeFavorito(this.userId, id).subscribe({
              next: () => {
                  // Atualiza o signal criando um novo Set (imutabilidade)
                  const novoSet = new Set(this.favoritosCache());
                  novoSet.delete(id);
                  this.favoritosCache.set(novoSet);
              }
          });
      } else {
          this.ativosService.addFavorito(this.userId, id).subscribe({
              next: () => {
                  const novoSet = new Set(this.favoritosCache());
                  novoSet.add(id);
                  this.favoritosCache.set(novoSet);
              }
          });
      }
  }

  trackById(index: number, item: Ativo): number {
    return item.id;
  }

  ngOnDestroy(): void {}

  carregarAtivos(): void {
    this.ativosService.getAtivos().subscribe({
      next: (data) => {
        this.ativosRaw.set(data);
        this.filtrarAtivos(); 
      }
    });
  }

  filtrarAtivos(): void {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      this.ativosFiltrados.set(this.ativosRaw());
      return;
    }
    const resultado = this.ativosRaw().filter(ativo => 
      ativo.nome.toLowerCase().includes(term) ||
      ativo.funcao_principal?.toLowerCase().includes(term)
    );
    this.ativosFiltrados.set(resultado);
  }
}