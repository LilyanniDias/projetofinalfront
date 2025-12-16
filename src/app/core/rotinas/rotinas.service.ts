import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
// 🚨 Importação do modelo que acabamos de criar
import { Rotina, RotinaPayload } from './rotinas.model'; 

@Injectable({
  providedIn: 'root'
})
export class RotinasService {
  
  // Simula o armazenamento das rotinas na memória
  private rotinasStore: WritableSignal<Rotina[]> = signal([]);
  private nextId = 1;

  constructor() { }

  /**
   * Salva uma nova rotina, adicionando ID e data de criação simulados.
   */
  salvarRotina(rotinaData: RotinaPayload): Observable<Rotina> {
    const newRotina: Rotina = {
      ...rotinaData,
      id: this.nextId++, // Atribui ID e incrementa
      data_criacao: new Date().toISOString(),
      usuario_id: 1 // ID de usuário fixo para simulação
    };
    
    this.rotinasStore.update(rotinas => [...rotinas, newRotina]);
    
    return of(newRotina); 
  }

  /**
   * Retorna todas as rotinas salvas do store.
   */
  getMinhasRotinas(): Observable<Rotina[]> {
    return of(this.rotinasStore());
  }
}