/* eslint-disable @angular-eslint/no-input-rename */
import { afterNextRender, DestroyRef, Directive, ElementRef, Host, HostListener, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TooltipService } from './tooltip.service';
import { TooltipConfiguration } from './tooltip-configuration';
import { TooltipRef } from './tooltip-ref';
import { isMobile, watchForLongPress } from './utils';

@Directive({
  selector: '[lcTooltip]'
})
export class TooltipDirective {
  @Input({ alias: 'lcTooltip', required: true })
  _content: TooltipConfiguration['content'] = '';

  @Input('lcTooltipPlacement')
  _placement?: TooltipConfiguration['placement'] = 'vertical';

  @Input('lcTooltipTheme')
  _theme?: TooltipConfiguration['theme'];

  @Input('lcTooltipShowWhenDisabled')
  _shouldShowWhenDisabled = false;

  private _isLongPressing = false;
  private _timeoutId = -1;
  private _tooltipRef?: TooltipRef;

  constructor(
    @Host() private readonly _hostElement: ElementRef<HTMLElement>,
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
          this._tooltipService.hideAll();
        });
      }
    });
  }

  private _showTooltip(event: MouseEvent | KeyboardEvent | PointerEvent) {
    event.stopPropagation();

    this._hideTooltip(event);

    const tooltipAnchor = event.target as Element;

    // Only show the tooltip if the content is present and the anchor is not disabled
    // or if the tooltip should be shown when disabled
    if (this._content && (!('disabled' in tooltipAnchor) || !tooltipAnchor.disabled || this._shouldShowWhenDisabled)) {
      this._timeoutId = window.setTimeout(() => {
        this._tooltipRef = this._tooltipService.show(tooltipAnchor, {
          content: this._content,
          placement: this._placement!,
          theme: this._theme
        });
      }, 250);
    }
  }

  private _hideTooltip(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    clearTimeout(this._timeoutId);

    this._tooltipRef?.hide();
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
