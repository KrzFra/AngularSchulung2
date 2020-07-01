import { Component, HostBinding, OnInit } from '@angular/core';
import { MovieShort } from '@core/interfaces/movie.interface';
import { Reservation } from '@core/interfaces/reservation.interface';
import { Screening } from '@core/interfaces/screening.interface';
import { MovieService } from '@core/services/movie/movie.service';
import { ScreeningsService } from '@core/services/schedule/screenings.service';
import { SelectionsService } from '@core/services/selections/selections.service';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-selections',
	templateUrl: './selections.component.html',
	styleUrls: ['./selections.component.scss'],
})
export class SelectionsComponent implements OnInit {
	@HostBinding() class = 'app-selections';

	moviesScreeningsSelections$: Observable<MoviesScreeningsSelections[]>;

	constructor(
		private _selectionsService: SelectionsService,
		private _movieService: MovieService,
		private _screeningsService: ScreeningsService
	) {}

	ngOnInit() {
		this.moviesScreeningsSelections$ = zip(
			this._selectionsService.getSelectedReservations(),
			this._screeningsService.getScreenings(),
			this._movieService.getMovies()
		).pipe(
			map((params: [Reservation[], Screening[], MovieShort[]]) => {
				const [selections, screenings, movies] = params;

				const selectionsByScreening: MoviesScreeningsSelections[] = [];

				selections.forEach((selection) => {
					const screening = screenings.find((s) => s.id === selection.screeningId);
					const movie = movies.find((m) => m.id === screening.movieId);

					const foundMovieSelection: MoviesScreeningsSelections = selectionsByScreening.find((sbs) => sbs.movie.id === movie.id);

					if (foundMovieSelection) {
						const foundScreening = foundMovieSelection.screenings.find((s) => s.screening.id === screening.id);

						if (foundScreening) {
							foundScreening.selections.push(selection);
						} else {
							foundMovieSelection.screenings.push({
								screening,
								selections: [selection],
							});
						}
					} else {
						selectionsByScreening.push({
							movie,
							screenings: [
								{
									screening,
									selections: [selection],
								},
							],
						});
					}
				});

				console.log(selectionsByScreening);

				return selectionsByScreening;
			})
		);
	}
}

interface MoviesScreeningsSelections {
	movie: MovieShort;
	screenings: {
		screening: Screening;
		selections: Reservation[];
	}[];
}
