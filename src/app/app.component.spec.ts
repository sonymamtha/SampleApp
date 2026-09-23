import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { TvShowService } from './services/tv-show.service';
import { TvShow } from './models/tv-show.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let tvShowServiceSpy: jasmine.SpyObj<TvShowService>;

  const mockShows: TvShow[] = [
    {
      id: 1,
      name: 'Game of Thrones',
      cast: [
        { id: 1, name: 'Actor B', birthday: '1980-01-01' },
        { id: 2, name: 'Actor A', birthday: '1970-01-01' }
      ]
    },
    {
      id: 2,
      name: 'Big Bang Theory',
      cast: [{ id: 3, name: 'Actor C', birthday: '1990-01-01' }]
    },
    {
      id: 3,
      name: 'Breaking Bad',
      cast: [{ id: 4, name: 'Actor D', birthday: '1960-01-01' }]
    }
  ];

  beforeEach(async () => {
    tvShowServiceSpy = jasmine.createSpyObj('TvShowService', ['getShows']);
    tvShowServiceSpy.getShows.and.returnValue(of(mockShows));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: TvShowService, useValue: tvShowServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should be in a loading state before ngOnInit resolves, and not after', () => {
    expect(component.loading).toBeTrue();
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
  });

  it('should sort each show\'s cast by birthday, oldest first', () => {
    fixture.detectChanges();

    const got = component.shows.find((s) => s.name === 'Game of Thrones')!;
    expect(got.cast.map((c) => c.name)).toEqual(['Actor A', 'Actor B']);
  });

  it('should set an error message and stop loading when the service call fails', () => {
    tvShowServiceSpy.getShows.and.returnValue(throwError(() => new Error('network error')));

    fixture.detectChanges();

    expect(component.error).toBe('Failed to load TV show data.');
    expect(component.loading).toBeFalse();
  });

  describe('pagination', () => {
    beforeEach(() => fixture.detectChanges());

    it('should default to a page size of 2 and compute total pages', () => {
      expect(component.pageSize).toBe(2);
      expect(component.totalPages).toBe(2);
    });

    it('should show the first page of results initially', () => {
      expect(component.pagedShows.map((s) => s.name)).toEqual(['Game of Thrones', 'Big Bang Theory']);
    });

    it('should navigate to the next page', () => {
      component.goToPage(2);

      expect(component.currentPage).toBe(2);
      expect(component.pagedShows.map((s) => s.name)).toEqual(['Breaking Bad']);
    });

    it('should ignore page numbers outside the valid range', () => {
      component.goToPage(0);
      expect(component.currentPage).toBe(1);

      component.goToPage(99);
      expect(component.currentPage).toBe(1);
    });

    it('should change page size and reset back to page 1', () => {
      component.goToPage(2);

      component.onPageSizeChange(5);

      expect(component.pageSize).toBe(5);
      expect(component.currentPage).toBe(1);
      expect(component.totalPages).toBe(1);
      expect(component.pagedShows.length).toBe(3);
    });
  });

  describe('search filtering', () => {
    beforeEach(() => fixture.detectChanges());

    it('should filter shows by name, case-insensitively', () => {
      component.onSearchChange('big bang');

      expect(component.filteredShows.length).toBe(1);
      expect(component.filteredShows[0].name).toBe('Big Bang Theory');
    });

    it('should reset to page 1 whenever the search term changes', () => {
      component.goToPage(2);

      component.onSearchChange('bang');

      expect(component.currentPage).toBe(1);
    });

    it('should restore the full list when the search term is cleared', () => {
      component.onSearchChange('bang');
      component.onSearchChange('');

      expect(component.filteredShows.length).toBe(3);
    });

    it('should render the "not found" message when no show matches the search', () => {
      component.onSearchChange('nonexistent show');
      fixture.detectChanges();

      expect(component.filteredShows.length).toBe(0);

      const compiled: HTMLElement = fixture.nativeElement;
      const message = compiled.querySelector('.no-results');
      expect(message?.textContent).toContain("couldn't find your TV show");
    });

    it('should hide pagination controls when there are no matching results', () => {
      component.onSearchChange('nonexistent show');
      fixture.detectChanges();

      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('.pagination')).toBeNull();
    });
  });
});
