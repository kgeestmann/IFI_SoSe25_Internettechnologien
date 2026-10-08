import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsAdminComponent } from './products-admin.component';
import { testProviders } from '../../../../testing/test-providers';

describe('ProductsAdminComponent', () => {
  let component: ProductsAdminComponent;
  let fixture: ComponentFixture<ProductsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsAdminComponent],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
