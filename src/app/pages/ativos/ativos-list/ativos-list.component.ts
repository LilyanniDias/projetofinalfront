import { Component, OnInit, WritableSignal, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AtivosService, Ativo } from '../../../core/ativos/ativos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

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

  // Signals
  favoritosCache: WritableSignal<Set<number>> = signal(new Set());
  ativosRaw: WritableSignal<Ativo[]> = signal([]);
  ativosFiltrados: WritableSignal<Ativo[]> = signal([]);
  searchTerm: WritableSignal<string> = signal('');
  selectedSkinType: WritableSignal<string> = signal('');

  // Lista de tipos de pele (copiada do inteligente-ativos)
  skinTypes = [
    "Todas, especialmente oleosa e acneica",
    "Todas, especialmente madura",
    "Pele Seca e Desidratada",
    "Pele Oleosa e Mista",
    "Todas, para luminosidade",
    "Todas, especialmente exposta ao sol",
    "Todas, para revitalização",
    "Pele Mista e Sensível",
    "Pele Normal a Oleosa (principalmente couro cabeludo)",
    "Pele Sensível e Seca",
    "Pele Seca, Madura e Lábios",
    "Todas, especialmente irritada",
    "Pele Seca e Madura",
    "Pele Oleosa e Mista",
    "Pele Oleosa e Acneica",
    "Pele Sensível e Reativa",
    "Pele Extremamente Seca",
    "Todas, com foco em reparação",
    "Todas, para viço",
    "Todas, com foco em celulite e firmeza",
    "Pele Sensível e Desvitalizada",
    "Pele Oleosa e Madura",
    "Pele Oleosa (substituto de sabão)",
    "Todas, com foco em uniformização",
    "Todas, para vitalidade",
    "Pele Sensível e Madura",
    "Pele Seca e Desvitalizada",
    "Pele com inchaço e dor (não em feridas abertas)",
    "Pele Normal a Seca",
    "Pele Seca e Corporal"
  ];

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

  ngOnDestroy(): void {}

  carregarAtivos(): void {
    this.errorMensagem = null;
    this.ativosService.getAtivos().subscribe({
      next: (data) => {
        this.ativosRaw.set(data);
        this.filtrarAtivos();
      },
      error: () => {
        this.errorMensagem = 'Erro ao carregar ativos.';
      }
    });
  }

  carregarFavoritosDoUsuario(): void {
    if (!this.userId) return;
    this.ativosService.getFavoritos(this.userId).subscribe({
      next: (favs) => {
        const novoSet = new Set<number>();
        favs.forEach(f => novoSet.add(f.id));
        this.favoritosCache.set(novoSet);
      }
    });
  }

  filtrarAtivos(): void {
    const term = this.searchTerm().toLowerCase().trim();
    const tipo = this.selectedSkinType();
    const rawData = this.ativosRaw();

    const resultado = rawData.filter(ativo => {
      const matchesSearch =
        ativo.nome.toLowerCase().includes(term) ||
        ativo.funcao_principal?.toLowerCase().includes(term) ||
        ativo.origem_geografica?.toLowerCase().includes(term) ||
        ativo.tipo_de_pele_indicada?.toLowerCase().includes(term);

      const matchesSkin = tipo
        ? ativo.tipo_de_pele_indicada?.toLowerCase().includes(tipo.toLowerCase())
        : true;

      return matchesSearch && matchesSkin;
    });

    this.ativosFiltrados.set(resultado);
  }

  onSkinTypeChange(): void {
    this.filtrarAtivos();
  }

  toggleFavorito(ativo: Ativo): void {
    if (!this.userId) return;

    const id = ativo.id;
    const jaEFavorito = this.isFavorito(ativo);

    if (jaEFavorito) {
      this.ativosService.removeFavorito(this.userId, id).subscribe({
        next: () => {
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

  isFavorito(ativo: Ativo): boolean {
    return this.favoritosCache().has(ativo.id);
  }

  trackById(index: number, item: Ativo): number {
    return item.id;
  }
}
