import { Component, OnInit, inject } from '@angular/core';
import { AtivosService, Ativo } from '../../../core/ativos/ativos.service'; // Ajuste o caminho

@Component({
  selector: 'app-ativos-list', // Usando 'ativos-list' para ser consistente
  templateUrl: './ativos-list.html', 
  styleUrls: ['./ativos-list.css']
})
export class AtivosListComponent implements OnInit {
  
  private ativosService = inject(AtivosService);
  
  ativos: Ativo[] = [];
  isLoading: boolean = true;
  
  // Variável de erro (mensagem que será exibida)
  errorMensagem: string | null = null; // Certifique-se que o nome seja 'errorMensagem'

  ngOnInit(): void {
    this.carregarAtivos();
  }

  carregarAtivos(): void {
    this.isLoading = true;
    this.errorMensagem = null; // Limpa a mensagem de erro quando começa a carregar os dados

    // Chamada ao serviço para buscar os ativos
    this.ativosService.getAtivos().subscribe({
      next: (data) => {
        this.ativos = data; // Se a requisição for bem-sucedida, popula a lista de ativos
        this.isLoading = false; // Marca o carregamento como concluído
      },
      error: (err) => {
        console.error('Erro ao carregar ativos:', err);
        this.errorMensagem = 'Falha ao conectar com o Backend (Node.js/MySQL). Verifique o console do servidor.'; // Atribui a mensagem de erro
        this.isLoading = false; // Marca o carregamento como concluído mesmo com erro
      }
    });
  }
}
