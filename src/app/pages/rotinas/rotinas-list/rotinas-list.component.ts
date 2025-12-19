import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { RotinasService } from '../../../core/rotinas/rotinas.service';
import { AtivosService } from '../../ativos/ativos.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-rotinas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rotinas-list.html',
  styleUrls: ['./rotinas-list.css']
})
export class RotinasComponent implements OnInit {

  private rotinasService = inject(RotinasService);
  private ativosService = inject(AtivosService);
  private authService = inject(AuthService);

  userId: number | null = null;
  nome = '';

  rotinasSalvas: any[] = [];

  ativosPorEtapa: any = {
    limpeza: [],
    tratamento: [],
    hidratacao: [],
    protecao: []
  };

  etapas: any = {
    limpeza: [],
    tratamento: [],
    hidratacao: [],
    protecao: []
  };

  /* =============================
     CICLO DE VIDA
  ==============================*/
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.buscarRotinasSalvas();
      }
    });

    this.carregarAtivos();
  }

  /* =============================
     ATIVOS
  ==============================*/
  carregarAtivos() {
    this.ativosService.listar().subscribe({
      next: (ativos: any[]) => {
        this.ativosPorEtapa = {
          limpeza: [],
          tratamento: [],
          hidratacao: [],
          protecao: []
        };

        ativos.forEach((a: any) => {
          const raw =
            a.funcao_cosmetica_primaria ||
            a.funcao_principal ||
            a.funcao ||
            '';

          const key = raw
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ç/g, 'c')
            .trim();

          if (this.ativosPorEtapa[key]) {
            this.ativosPorEtapa[key].push(a);
          }
        });
      },
      error: err => console.error('Erro ao carregar ativos:', err)
    });
  }

  toggleAtivo(etapa: string, ativoId: number, event: any) {
    const checked = event.target.checked;

    if (checked) {
      if (!this.etapas[etapa].includes(ativoId)) {
        this.etapas[etapa].push(ativoId);
      }
    } else {
      this.etapas[etapa] = this.etapas[etapa].filter(
        (id: number) => id !== ativoId
      );
    }
  }

  /* =============================
     CRIAR ROTINA
  ==============================*/
  salvar() {
    if (!this.userId) {
      alert('Usuário não identificado');
      return;
    }

    if (!this.nome.trim()) {
      alert('Digite um nome para a rotina');
      return;
    }

    const temAtivos = Object.values(this.etapas).some(
      (arr: any) => arr.length > 0
    );

    if (!temAtivos) {
      alert('Selecione ao menos um ativo');
      return;
    }

    const payload = {
      userId: this.userId,
      nome: this.nome,
      etapas: this.etapas
    };

    this.rotinasService.criar(payload).subscribe({
      next: () => {
        alert('✨ Rotina salva com sucesso!');
        this.resetarFormulario();
        this.buscarRotinasSalvas();
      },
      error: err => console.error('Erro ao salvar rotina:', err)
    });
  }

  /* =============================
     LISTAR ROTINAS
  ==============================*/
  buscarRotinasSalvas() {
    if (!this.userId) return;

    this.rotinasService.listar(this.userId).subscribe({
      next: (res: any) => {
        this.rotinasSalvas = res.rotinas ?? res;
      },
      error: err => console.error('Erro ao buscar rotinas:', err)
    });
  }

  /* =============================
     REMOVER ROTINA
  ==============================*/
  remover(rotinaId: number) {
    if (!confirm('Deseja realmente excluir esta rotina?')) return;

    this.rotinasService.remover(rotinaId).subscribe({
      next: () => {
        alert('🗑️ Rotina removida com sucesso');
        this.buscarRotinasSalvas();
      },
      error: err => console.error('Erro ao remover rotina:', err)
    });
  }

  /* =============================
     UTIL
  ==============================*/
  resetarFormulario() {
    this.nome = '';
    this.etapas = {
      limpeza: [],
      tratamento: [],
      hidratacao: [],
      protecao: []
    };
  }

  getNomeAtivo(id: number): string {
    const todosAtivos = Object.values(this.ativosPorEtapa).flat() as any[];
    const ativo = todosAtivos.find(a => a.id === id);
    return ativo ? ativo.nome : 'Ativo não encontrado';
  }
}
