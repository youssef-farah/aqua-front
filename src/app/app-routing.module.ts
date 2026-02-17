import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { BoutiqueComponent } from './components/boutique/boutique.component';
import { DashboardComponent } from './components/back-office/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ContactComponent } from './components/contact/contact.component';
import { CompteComponent } from './components/compte/compte.component';
import { AproposComponent } from './components/apropos/apropos.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component';
import { ProductCrudComponent } from './components/back-office/product-crud/product-crud.component';
import { CategoryCrudComponent } from './components/back-office/category-crud/category-crud.component';
import { OrdersComponent } from './components/back-office/orders/orders.component';
import { MainComponent } from './components/back-office/main/main.component';
import { ServicesComponent } from './components/services/services.component';
import { OffresComponent } from './components/back-office/offres/offres.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { OffresboutiqueComponent } from './components/offresboutique/offresboutique.component';
import { DosageComponent } from './components/dosage/dosage.component';
import { FailpayComponent } from './components/failpay/failpay.component';
import { SuccespayComponent } from './components/succespay/succespay.component';
import { RedirectpageComponent } from './components/redirectpage/redirectpage.component';
import { ContinfosComponent } from './components/continfos/continfos.component';
const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'boutique', component: BoutiqueComponent },
    { path: 'dosage', component: DosageComponent },


  {path:'contact', component:ContactComponent},
  {path:'compte', component:CompteComponent},
  {path:'apropos', component:AproposComponent},
  {path: 'product-details/:id', component: ProductDetailsComponent },
  {path:'panier', component:CartComponent},
  {path:'produits', component:ProductCrudComponent},
  {path:'services',component: ServicesComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  //{path:'orders', component:OrdersComponent},
    {path:'offresboutique', component:OffresboutiqueComponent},
    {path:'failpay', component:FailpayComponent},
    {path:'succespay', component:SuccespayComponent},
    {path:'redirectpage', component:RedirectpageComponent},
    {path:'continfos', component:ContinfosComponent},

  {path:"main",component:MainComponent,  canActivate: [AuthGuard],children:[
    { path: "", redirectTo: "dashboard", pathMatch: "full" },
    {path:"dashboard",component:DashboardComponent},
    {path:"produits",component:ProductCrudComponent},
    {path:'categories', component:CategoryCrudComponent},
    {path:'orders', component:OrdersComponent},
    {path:'offres', component:OffresComponent}, 


   // {path:"dashboard/statistics",component:DbsStatisticsComponent},

]},


  { path: 'dash', component: DashboardComponent,//canActivate: [AuthGuard]
     },

  { path: '**', redirectTo: 'home' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
  scrollPositionRestoration: 'top'
})
],
  exports: [RouterModule]
})
export class AppRoutingModule { }
