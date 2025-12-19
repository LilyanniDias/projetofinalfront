import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface atualizada para não quebrar seus outros componentes
export interface Ativo {
  id: number;
  nome: string;
  origem?: string;
  funcao?: string;
  indicado?: string;
  funcao_cosmetica_primaria?: string; // <--- ADICIONE ESTA LINHA
  [key: string]: any; // <--- E ESTA TAMBÉM (ajuda a evitar erros futuros)
}

@Injectable({
  providedIn: 'root'
})
export class AtivosService {
  private API = 'http://localhost:3000/api/ativos';
  private FAVORITOS_API = 'http://localhost:3000/api/favorites';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Ativo[]>(this.API);
  }

  getFavoritos(userId: number): Observable<Ativo[]> {
    return this.http.get<Ativo[]>(`${this.FAVORITOS_API}/${userId}`);
  }

  removeFavorito(userId: number, assetId: number): Observable<any> {
    return this.http.delete(`${this.FAVORITOS_API}/${userId}/${assetId}`);
  }
}