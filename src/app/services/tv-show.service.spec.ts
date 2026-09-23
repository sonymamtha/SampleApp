import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TvShowService } from './tv-show.service';
import { TvShow } from '../models/tv-show.model';

describe('TvShowService', () => {
  let service: TvShowService;
  let httpMock: HttpTestingController;

  const mockShows: TvShow[] = [
    {
      id: 1,
      name: 'Game of Thrones',
      cast: [{ id: 1, name: 'Actor A', birthday: '1970-01-01' }]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TvShowService]
    });

    service = TestBed.inject(TvShowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch TV shows from assets/data.json via GET', () => {
    let result: TvShow[] | undefined;

    service.getShows().subscribe((shows) => (result = shows));

    const req = httpMock.expectOne('assets/data.json');
    expect(req.request.method).toBe('GET');

    req.flush(mockShows);

    expect(result).toEqual(mockShows);
  });

  it('should propagate an error when the request fails', () => {
    let capturedError: unknown;

    service.getShows().subscribe({
      next: () => fail('expected an error, not a value'),
      error: (err) => (capturedError = err)
    });

    const req = httpMock.expectOne('assets/data.json');
    req.flush('not found', { status: 404, statusText: 'Not Found' });

    expect(capturedError).toBeTruthy();
  });
});
