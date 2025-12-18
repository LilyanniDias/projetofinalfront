import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RotinasService {

  private api = 'http://localhost:3000/api/rotinas';

  constructor(private http: HttpClient) {}

  criar(rotina: any) {
    return this.http.post(this.api, rotina);
  }

  listar(userId: number) {
    return this.http.get(`${this.api}/${userId}`);
  }

  remover(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
