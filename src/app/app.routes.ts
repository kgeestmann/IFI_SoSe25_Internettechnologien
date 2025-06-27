import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list.component';
import { CustomerListComponent } from './user/employee-dashboard/customer-list/customer-list.component';
import { OrderListComponent } from './user/employee-dashboard/order-list/order-list.component';
import { LoginComponent } from './user/login/login.component'; 
import { CartListComponent } from './user/customer-dashboard/cart-list/cart-list.component'; 
import { CustomerDashboardComponent } from './user/customer-dashboard/customer-dashboard/customer-dashboard.component'; 
import { EmployeeDashboardComponent } from './user/employee-dashboard/employee-dashboard/employee-dashboard.component';
import { ContactComponent } from './contact/contact.component';
import { RegistrationComponent } from './user/registration/registration.component';



export const routes: Routes = [
    { path: 'products', component: ProductListComponent },

    { path: 'cart', component: CartListComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'customer-dashboard', component: CustomerDashboardComponent },
    { path: 'customer-orders', component: OrderListComponent },
    { path: 'employee-dashboard', component: EmployeeDashboardComponent },
    { path: 'customers-admin', component: CustomerListComponent },
    { path: 'orders-admin', component: OrderListComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent}, 
    { path: '', redirectTo: '/products', pathMatch: 'full' }  // Default-Route
];