import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { BoutiqueComponent } from './components/boutique/boutique.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './components/back-office/dashboard/dashboard.component';
import { ProductCrudComponent } from './components/back-office/product-crud/product-crud.component';
import { CategoryCrudComponent } from './components/back-office/category-crud/category-crud.component';
import { ContactComponent } from './components/contact/contact.component';
import { CompteComponent } from './components/compte/compte.component';
import { AproposComponent } from './components/apropos/apropos.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { OffreComponent } from './components/offre/offre.component';
import { OrdersComponent } from './components/back-office/orders/orders.component';
import { SidebarComponent } from './components/back-office/sidebar/sidebar.component';
import { MainComponent } from './components/back-office/main/main.component';
import { AuthInterceptor } from './Interceptors/auth-interceptor';
import { ServicesComponent } from './components/services/services.component';
import { OffresComponent } from './components/back-office/offres/offres.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { OffresboutiqueComponent } from './components/offresboutique/offresboutique.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    BoutiqueComponent,
    DashboardComponent,
    ProductCrudComponent,
    CategoryCrudComponent,
    ContactComponent,
    CompteComponent,
    AproposComponent,
    ProductDetailsComponent,
    CartComponent,
    OffreComponent,
    OrdersComponent,
    SidebarComponent,
    MainComponent,
    ServicesComponent,
    OffresComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    OffresboutiqueComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
    
  
    
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
