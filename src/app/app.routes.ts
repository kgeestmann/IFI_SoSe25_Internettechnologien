import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list.component';
import { CustomerListComponent } from './user/employee-dashboard/customer-list/customer-list.component';
import { OrderListComponent } from './user/employee-dashboard/order-list/order-list.component';

export const routes: Routes = [
    { path: 'products', component: ProductListComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'orders', component: OrderListComponent },
    { path: '', redirectTo: '/products', pathMatch: 'full' }  // Default-Route
];