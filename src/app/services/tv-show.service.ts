import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TvShow } from '../models/tv-show.model';

@Injectable({ providedIn: 'root' })
export class TvShowService {
  private readonly dataUrl = 'assets/data.json';

  constructor(private http: HttpClient) {}

  getShows(): Observable<TvShow[]> {
    return this.http.get<TvShow[]>(this.dataUrl);
  }
}
