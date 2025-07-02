import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list.component';
import { CustomerListComponent } from './user/employee-dashboard/customer-list/customer-list.component';
import { OrderListComponent } from './user/employee-dashboard/order-list/order-list.component';
import { LoginComponent } from './user/login/login.component'; 
import { CartListComponent } from './user/customer-dashboard/cart-list/cart-list.component'; 
import { EmployeeProfileComponent } from './user/employee-dashboard/employee-profile/employee-profile.component';
import { ContactComponent } from './contact/contact.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { CustomerProfileComponent } from './user/customer-dashboard/customer-profile/customer-profile.component';
import { MyOrdersComponent } from './user/customer-dashboard/my-orders/my-orders.component';
import { ProductsAdminComponent } from './user/employee-dashboard/products-admin/products-admin.component';

export const routes: Routes = [
    { path: 'products', component: ProductListComponent },
    { path: 'cart', component: CartListComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'customer-orders', component: MyOrdersComponent },
    { path: 'employee-profile', component: EmployeeProfileComponent },
    { path: 'products-admin', component: ProductsAdminComponent },
    { path: 'customers-admin', component: CustomerListComponent },
    { path: 'orders-admin', component: OrderListComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent}, 
    { path: 'customer-profile', component: CustomerProfileComponent},
    { path: '', redirectTo: '/products', pathMatch: 'full' }
];