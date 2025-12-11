import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; 
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './app/core/interceptors/token-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // Configura o HttpClient e adiciona o interceptor para todas as requisições
    provideHttpClient(
        withInterceptors([
            TokenInterceptor 
        ])
    )
  ]
}).catch(err => console.error(err));