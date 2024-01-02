import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  Host,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { Subscription } from 'rxjs';

import { Placement } from './placement';
import { Theme } from './theme';
import { TooltipService } from './tooltip.service';
import { isMobile, watchForLongPress } from './utils';

@Directive({
  selector: '[bbbTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy, AfterViewInit {
  @Input('bbbTooltip')
  _content = '';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('bbbTooltipPlacement')
  _placement?: 'vertical' | 'horizontal' | Placement;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('bbbTooltipTheme')
  _theme: Theme = 'light';

  private _longPressEventSubscription?: Subscription;
  private _isLongPressing = false;
  private _timeoutId = -1;

  constructor(
    @Host() private readonly _hostElement: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private readonly _tooltipService: TooltipService
  ) {}

  ngOnDestroy() {
    this._tooltipService.hide();
    this._longPressEventSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    if (isMobile()) {
      this._longPressEventSubscription = watchForLongPress(this._hostElement.nativeElement).subscribe({
        next: event => {
          this._isLongPressing = true;
          this._showTooltip(event);
        }
      });
    }
  }

  private _showTooltip(event: MouseEvent | KeyboardEvent | PointerEvent) {
    this._hideTooltip(event);

    event.stopPropagation();

    this._timeoutId = setTimeout(() => {
      this._tooltipService.show(event.target as Element, {
        content: this._content,
        placement: this._placement as Placement,
        theme: this._theme as Theme
      });
    }, 500);
  }

  private _hideTooltip(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();

    if (this._timeoutId !== -1) {
      this._tooltipService.hide();
      clearTimeout(this._timeoutId);
      this._timeoutId = -1;
    }
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
