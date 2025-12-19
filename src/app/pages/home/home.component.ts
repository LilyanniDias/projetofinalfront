import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 🚨 Router injetado para navegação
// ... (outras importações)

// 🚨 CORREÇÃO DOS CAMINHOS RELATIVOS
import { AtivosService, Ativo } from '../../core/ativos/ativos.service'; 
import { AuthService } from '../../core/auth/auth.service'; 
import { CardAtivoComponent } from '../../shared/card-ativo/card-ativo.component'; 
// Fim das correções de caminho

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html', 
  styleUrls: ['./home.css'], 
  imports: [CommonModule, RouterModule, CardAtivoComponent], 
})
export class HomeComponent implements OnInit {
  private ativosService = inject(AtivosService);
  // 🚨 authService é injetado como privado, mas deve ser acessado por um método ou getter no template,
  // ou você pode torná-lo público se preferir usar o pipe async diretamente no HTML.
  private authService = inject(AuthService); 
  private router = inject(Router); // 🚨 Injeta o Router para redirecionar após o logout

  ativosEmDestaque: Ativo[] = [];
  isLoading: boolean = true;
  isLoggedIn: boolean = true;
  userName: string = 'Visitante';

  ngOnInit(): void {
    this.setupAuthListener();
    this.carregarAtivosDestaque();
  }

  setupAuthListener(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.currentUser$.subscribe(User => {
      if (User) {
        // Pega apenas o primeiro nome
        this.userName = User.nome.split(' ')[0]; 
      } else {
        this.userName = 'Visitante';
      }
    });
  }

  carregarAtivosDestaque(): void {
    this.isLoading = true;
    const filtros = { limite: 4, destaque: true }; 

    this.ativosService.getAtivos(filtros).subscribe({
      next: (data) => {
        this.ativosEmDestaque = data.slice(0, 4); 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ativos de destaque:', err);
        this.isLoading = false;
      }
    });
  }
  
  /**
   * 🚨 NOVO MÉTODO: Função para sair da conta
   * Chamada pelo botão no home.html
   */
  onLogout(): void {
    this.authService.logout();
    // Redireciona o usuário para a página de login ou para a home, forçando a atualização dos botões.
    this.router.navigate(['/login']); 
    // Opcional: Se quiser garantir que a tela inicial reflita o estado de deslogado imediatamente,
    // embora o Angular reativo deva fazer isso:
    // window.location.reload();
  }
  ativosFixos = [
    { nome: 'Óleo de Copaíba', origem: 'Amazônia', funcao: 'Anti-inflamatório', indicado: 'Peles acneicas' },
    { nome: 'Extrato de Açaí', origem: 'Amazônia', funcao: 'Antioxidante', indicado: 'Peles maduras' },
    { nome: 'Manteiga de Cupuaçu', origem: 'Amazônia', funcao: 'Hidratante Emoliente', indicado: 'Pele Seca' },
    { nome: 'Argila Verde', origem: 'Minas Gerais', funcao: 'Controle de Oleosidade', indicado: 'Pele Oleosa' },
    { nome: 'Extrato de Acerola', origem: 'Nordeste', funcao: 'Vitamina C Natural', indicado: 'Luminosidade' },
    { nome: 'Óleo de Buriti', origem: 'Cerrado', funcao: 'Proteção Solar Natural', indicado: 'Pele sensível' }
  ];
}