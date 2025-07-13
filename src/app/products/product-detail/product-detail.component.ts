import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../product.service';
import { CartService } from '../../user/customer-dashboard/cart-list/cart.service';
import { AuthService } from '../../auth.service';
import { CommonModule, Location } from '@angular/common';
import { SocketService } from '../../socket.service';

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')])
    ])
  ]
})
export class ProductDetailComponent implements OnInit {
  product: (Product & { infoText?: string; care?: string }) | null = null;
  isCustomer = false;
  showCare = false;
  showInfo = false;
  showLowStock = false;

  recommendedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productService.getProducts().subscribe(products => {
          const found = products.find(p => p.product_id === +id) || null;
          if (found) {
            /*this.product = {
              ...found,
              infoText: this.getInfoText(found.name),
              care: this.getCareText(found.name)
            };*/
            this.product = found;

            this.recommendedProducts = products
              .filter(p => p.product_id !== +id)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);
          }
        });
      }
    });

    this.authService.isCustomer$.subscribe(status => {
      this.isCustomer = status;
    });

    this.socketService.onLowStock().subscribe((data) => {
      if (this.product && data.product_id === this.product.product_id) {
        this.showLowStock = data.stock <= 5;
      }
    });
  }


  goToProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.add(this.product);
      alert(`${this.product.name} wurde zum Warenkorb hinzugefügt.`);
    }
  }

  goBack(): void {
    this.location.back();
  }

  goToCart(): void {
    this.router.navigate([this.isCustomer ? '/cart' : '/login']);
  }

  toggleCare(): void {
    this.showCare = !this.showCare;
  }

  toggleInfo(): void {
    this.showInfo = !this.showInfo;
  }

  /*getInfoText(name: string): string {
    switch (name) {
      case 'Sansevieria':
        return 'Die Sansevieria ist eine äußerst robuste Zimmerpflanze mit aufrecht wachsenden, schwertförmigen Blättern. Sie passt perfekt in jedes Zuhause.';
      case 'Aloe Vera':
        return 'Die Aloe Vera ist eine beliebte Sukkulente mit heilenden Eigenschaften. Sie ist ideal für sonnige Fensterplätze geeignet.';
      case 'Ficus benjamina':
        return 'Der Ficus benjamina ist ein eleganter Zimmerbaum mit glänzenden Blättern und ein echter Klassiker für Wohnzimmer oder Büros.';
      case 'Calathea':
        return 'Die Calathea überzeugt mit aufwändigen Blattmustern und schließt ihre Blätter nachts – eine „bewegte“ Pflanze.';
      case 'Monstera deliciosa':
        return 'Die Monstera ist ein echter Blickfang mit auffälligen, geschlitzten Blättern – sehr beliebt in modernen Einrichtungen.';
      default:
        return 'Keine weiteren Informationen verfügbar.';
    }
  }

  getCareText(name: string): string {
    switch (name) {
      case 'Sansevieria':
        return 'Hell bis halbschattig. Gießen alle 2–3 Wochen. Sehr robust und luftreinigend.';
      case 'Aloe Vera':
        return 'Viel Sonne, wenig Wasser. Erde gut abtrocknen lassen.';
      case 'Ficus benjamina':
        return 'Heller Standort, gleichmäßiges Gießen. Keine Zugluft.';
      case 'Calathea':
        return 'Licht ohne direkte Sonne, hohe Luftfeuchtigkeit, weiches Wasser.';
      case 'Monstera deliciosa':
        return 'Lichtreich, aber keine direkte Sonne. Regelmäßig gießen. Kletterhilfe fördert das Wachstum.';
      default:
        return 'Keine Pflegehinweise verfügbar.';
    }
  }*/
}
