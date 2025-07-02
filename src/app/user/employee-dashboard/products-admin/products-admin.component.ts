import { Component } from '@angular/core';
import { ProductListComponent } from '../../../products/product-list/product-list.component';

@Component({
  selector: 'app-products-admin',
  imports: [ProductListComponent],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.css'
})
export class ProductsAdminComponent {

}
