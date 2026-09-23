import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TvShow } from './models/tv-show.model';
import { TvShowService } from './services/tv-show.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  shows: TvShow[] = [];
  filteredShows: TvShow[] = [];
  pagedShows: TvShow[] = [];
  loading = true;
  error: string | null = null;

  searchTerm = '';

  pageSize = 2;
  currentPage = 1;
  totalPages = 1;

  constructor(private tvShowService: TvShowService) {}

  ngOnInit(): void {
    this.tvShowService.getShows().subscribe({
      next: (data) => {
        this.shows = data.map((show) => ({
          ...show,
          cast: [...show.cast].sort(
            (a, b) => new Date(a.birthday).getTime() - new Date(b.birthday).getTime()
          )
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load TV show data.';
        this.loading = false;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredShows = term
      ? this.shows.filter((show) => show.name.toLowerCase().includes(term))
      : this.shows;
    this.totalPages = Math.max(1, Math.ceil(this.filteredShows.length / this.pageSize));
    this.updatePagedShows();
  }

  updatePagedShows(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedShows = this.filteredShows.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePagedShows();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.totalPages = Math.max(1, Math.ceil(this.filteredShows.length / this.pageSize));
    this.currentPage = 1;
    this.updatePagedShows();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
