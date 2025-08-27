import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReusableFilteredTable } from "./reusable-filtered-table/reusable-filtered-table";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReusableFilteredTable],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('primeng-table-app');
}
