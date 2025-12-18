import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AtivosService {

  private API = 'http://localhost:3000/api/ativos';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.API);
  }
}
