import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './core/layout/navbar/navbar';
import { Sidebar } from './core/layout/sidebar/sidebar';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(public auth: AuthService) {}
}
