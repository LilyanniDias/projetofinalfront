import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RotinasService } from '../../../core/rotinas/rotinas.service';
import { AtivosService } from '../../ativos/ativos.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rotinas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rotinas-list.html',
  styleUrls: ['./rotinas-list.css']
})
export class RotinasComponent implements OnInit {
  private service = inject(RotinasService);
  private ativosService = inject(AtivosService);

  userId = 1;
  nome = '';

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

  ngOnInit() {
    this.carregarAtivos();
  }

  carregarAtivos() {
    this.ativosService.listar().subscribe({
      next: (ativos) => {
        // Limpa antes de carregar para evitar duplicatas
        this.ativosPorEtapa = { limpeza: [], tratamento: [], hidratacao: [], protecao: [] };
        
        ativos.forEach(a => {
          // Proteção contra valores nulos no banco de dados
          const campoFuncao = a.funcao_cosmetica_primaria || a.funcao || '';
          
          const key = campoFuncao
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

          if (this.ativosPorEtapa[key]) {
            this.ativosPorEtapa[key].push(a);
          }
        });
      },
      error: (err) => console.error('Erro ao buscar ativos:', err)
    });
  }

  // ATUALIZADO: Agora recebe o evento do navegador corretamente
  toggleAtivo(etapa: string, ativoId: number, event: any) {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      if (!this.etapas[etapa].includes(ativoId)) {
        this.etapas[etapa].push(ativoId);
      }
    } else {
      this.etapas[etapa] = this.etapas[etapa].filter((id: number) => id !== ativoId);
    }
  }

  salvar() {
    // Validação simples antes de enviar
    if (!this.nome.trim()) {
      alert('Dê um nome para sua rotina!');
      return;
    }

    // Verifica se pelo menos um ativo foi selecionado
    const totalSelecionados = Object.values(this.etapas).flat().length;
    if (totalSelecionados === 0) {
      alert('Selecione pelo menos um ativo para sua rotina.');
      return;
    }

    this.service.criar({
      userId: this.userId,
      nome: this.nome,
      etapas: this.etapas
    }).subscribe({
      next: () => {
        alert('Rotina salva com sucesso!');
        this.nome = '';
        // Opcional: recarregar a página ou limpar os checks
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
        alert(err.error?.message || 'Erro ao conectar com o servidor.');
      }
    });
  }
}