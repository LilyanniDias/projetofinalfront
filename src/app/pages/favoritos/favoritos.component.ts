import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtivosService, Ativo } from '../../core/ativos/ativos.service';
import { AuthService } from '../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  private ativosService = inject(AtivosService);
  private authService = inject(AuthService);

  // Lista de ativos favoritados
  listaFavoritos: WritableSignal<Ativo[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  userId: number | null = null;

  ngOnInit(): void {
    // Busca o ID do usuário logado
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.carregarFavoritos();
      }
    });
  }

  carregarFavoritos(): void {
    if (!this.userId) return;

    this.isLoading.set(true);
    this.ativosService.getFavoritos(this.userId).subscribe({
      next: (data) => {
        this.listaFavoritos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar favoritos:', err);
        this.isLoading.set(false);
      }
    });
  }

  removerDosFavoritos(ativoId: number): void {
    if (!this.userId) return;

    this.ativosService.removeFavorito(this.userId, ativoId).subscribe({
      next: () => {
        // Atualiza a lista local removendo o item
        const novaLista = this.listaFavoritos().filter(a => a.id !== ativoId);
        this.listaFavoritos.set(novaLista);
      },
      error: (err) => console.error('Erro ao remover:', err)
    });
  }
}