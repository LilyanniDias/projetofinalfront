import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Necessário para o roteamento

@Component({
  selector: 'app-root', // Este é o seletor usado no index.html
  standalone: true, // Indica que é um componente standalone
  imports: [RouterOutlet], // Inclui o módulo de roteamento
  template: `
    <router-outlet></router-outlet>
    <h1>Olá, Angular está funcionando!</h1> 
  `,
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Projeto Final Front';
}