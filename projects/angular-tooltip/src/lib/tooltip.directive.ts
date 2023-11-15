import { AfterViewInit, Directive, ElementRef, Host, HostListener, Input, OnDestroy } from '@angular/core';
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
  // eslint-disable-next-line @stylistic/indent
  _content = '';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('bbbTooltipPlacement')
  // eslint-disable-next-line @stylistic/indent
  _placement?: 'vertical' | 'horizontal' | Placement;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('bbbTooltipTheme')
  // eslint-disable-next-line @stylistic/indent
  _theme: 'dark' | 'light' | Theme = Theme.LIGHT;

  private _longPressEventSubscription?: Subscription;
  private _isLongPressing = false;

  constructor(
    @Host() private readonly _hostElement: ElementRef<HTMLElement>,
    private readonly _tooltipService: TooltipService
  ) {}

  ngOnDestroy() {
    this._tooltipService.hide();
    this._longPressEventSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
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

    this._tooltipService.show(event.target as Element, {
      content: this._content,
      placement: this._placement as Placement,
      theme: this._theme as Theme
    });
  }

  private _hideTooltip(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
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
