import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  Host,
  HostListener,
  Inject,
  inject,
  Input,
  PLATFORM_ID
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { Placement } from './placement';
import { Theme } from './theme';
import { TooltipService } from './tooltip.service';
import { isMobile, watchForLongPress } from './utils';

@Directive({
  selector: '[lcTooltip]'
})
export class TooltipDirective {
  @Input('lcTooltip')
  _content = '';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('lcTooltipPlacement')
  _placement?: 'vertical' | 'horizontal' | Placement;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('lcTooltipTheme')
  _theme: Theme = 'light';

  private _longPressEventSubscription?: Subscription;
  private _isLongPressing = false;
  private _timeoutId = -1;

  constructor(
    @Host() private readonly _hostElement: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private readonly _tooltipService: TooltipService
  ) {
    const destroyRef = inject(DestroyRef);

    afterNextRender({
      write: () => {
        if (!isMobile()) {
          return;
        }

        watchForLongPress(this._hostElement.nativeElement)
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: event => {
              this._isLongPressing = true;
              this._showTooltip(event);
            }
          });

        destroyRef.onDestroy(() => {
          this._tooltipService.hide();
        });
      }
    });
  }

  private _showTooltip(event: MouseEvent | KeyboardEvent | PointerEvent) {
    event.stopPropagation();

    this._hideTooltip(event);

    const tooltipAnchor = event.target as Element;

    if ((tooltipAnchor instanceof HTMLButtonElement && tooltipAnchor.disabled) || this._content === '') {
      return;
    }

    this._timeoutId = window.setTimeout(() => {
      this._tooltipService.show(tooltipAnchor, {
        content: this._content,
        placement: this._placement!,
        theme: this._theme
      });
    }, 500);
  }

  private _hideTooltip(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    clearTimeout(this._timeoutId);

    this._tooltipService.hide();
  }

  /**
   * Tooltip is only shown on pointerover events iff we are not on a mobile device
   */
  @HostListener('pointerover', ['$event'])
  protected _onShowTooltipOnHover(event: MouseEvent) {
    if (!isMobile()) {
      this._showTooltip(event);
    }
  }

  @HostListener('keyup', ['$event'])
  protected _onShowTooltipOnFocus(event: KeyboardEvent) {
    if (document.activeElement === this._hostElement.nativeElement) {
      this._showTooltip(event);
    }
  }

  @HostListener('pointerout', ['$event'])
  @HostListener('blur', ['$event'])
  @HostListener('click', ['$event'])
  protected _onHideTooltip(event: MouseEvent | KeyboardEvent) {
    if (!this._isLongPressing) {
      this._hideTooltip(event);
    }
  }

  @HostListener('window:pointerup', ['$event'])
  protected _onHideTooltipOnWindowPointerUp(event: PointerEvent) {
    if (this._isLongPressing && event.target !== this._hostElement.nativeElement) {
      this._hideTooltip(event);
    }
  }
}
