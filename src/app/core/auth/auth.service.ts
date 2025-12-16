import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs'; 

export interface User {
    id: number;
    nome: string;
    email: string;
    // Defina todos os campos que vêm do seu backend após o login/cadastro
}

export interface AuthResponse {
    user: User;
    token: string; // O token JWT que será armazenado
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    
    // 🚨 URL BASE CORRIGIDA: Contém apenas o prefixo do módulo de autenticação.
    private authUrl = 'http://localhost:3000/api/auth'; 
    
    // Sujeitos para monitorar o estado de login e usuário atual
    private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
    isLoggedIn$ = this.isLoggedInSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        // Tenta carregar dados do usuário ao iniciar o serviço
        this.loadUserFromStorage();
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    private loadUserFromStorage(): void {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            try {
                this.currentUserSubject.next(JSON.parse(userData));
                this.isLoggedInSubject.next(true);
            } catch (e) {
                // Se o JSON estiver corrompido, limpa tudo
                this.logout(); 
            }
        }
    }

    /**
     * Envia credenciais para a rota de login.
     * Rota final: http://localhost:3000/api/auth/login
     */
    login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
            // Processa e armazena token e dados do usuário se o login for bem-sucedido
            tap(res => this.handleAuthResponse(res))
        );
    }
    
    /**
     * Envia dados para a rota de cadastro.
     * Rota final: http://localhost:3000/api/auth/register
     */
    register(userData: any): Observable<AuthResponse> {
        // Nota: A resposta do cadastro não chama handleAuthResponse, pois geralmente 
        // o usuário é redirecionado para a página de login após o registro.
        return this.http.post<AuthResponse>(`${this.authUrl}/register`, userData);
    }

    private handleAuthResponse(res: AuthResponse): void {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user_data', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
        this.isLoggedInSubject.next(true);
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}