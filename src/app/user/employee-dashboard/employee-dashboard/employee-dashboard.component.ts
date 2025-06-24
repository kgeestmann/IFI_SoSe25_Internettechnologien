import { Component } from '@angular/core';
import {CommonModule } from '@angular/common'; // NgFor ist im CommonModule enthalten
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent {

}
