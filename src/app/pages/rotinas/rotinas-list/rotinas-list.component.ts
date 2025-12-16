import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 
import { RotinasService } from '../../../core/rotinas/rotinas.service';
import { Rotina } from '../../../core/rotinas/rotinas.model'; 

@Component({
  selector: 'app-rotinas-list',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './rotinas-list.html',
  styleUrls: ['./rotinas-list.css']
})
export class RotinasListComponent {

  private rotinasService = inject(RotinasService);
  
  rotinas: WritableSignal<Rotina[]> = signal([]);
  
  errorMensagem: string | null = null;

  constructor() {
    // Carrega as rotinas assim que o componente é criado
    this.carregarRotinas();
  }

  carregarRotinas(): void {
    this.errorMensagem = null;

    // 🚨 Usa o nome correto do método: getMinhasRotinas
    this.rotinasService.getMinhasRotinas().subscribe({
      next: (data) => {
        this.rotinas.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar rotinas:', err);
        this.errorMensagem = 'Falha ao carregar as rotinas salvas.';
      }
    });
  }
}