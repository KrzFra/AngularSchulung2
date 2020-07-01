import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { SelectionsService } from '@core/services/selections/selections.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
	@HostBinding() class = 'app-header';

	amountOfSelections = 0;

	private _destroyed$ = new Subject<void>();

	constructor(private _selectionsService: SelectionsService, private changeDetector: ChangeDetectorRef) {}

	ngOnInit() {
		this._selectionsService
			.getSelectedReservations()
			.pipe(takeUntil(this._destroyed$))
			.subscribe((sr) => {
				this.amountOfSelections = sr.length;
				this.changeDetector.markForCheck();
			});
	}

	ngOnDestroy() {
		this._destroyed$.next();
		this._destroyed$.complete();
	}
}
