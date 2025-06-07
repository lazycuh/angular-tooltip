import { afterNextRender, DestroyRef, Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TooltipService } from './tooltip.service';
import { TooltipConfiguration } from './tooltip-configuration';
import { TooltipRef } from './tooltip-ref';
import { isMobile, watchForLongPress } from './utils';

@Directive({
  selector: '[lcTooltip]'
})
export class TooltipDirective {
  readonly content = input.required<TooltipConfiguration['content']>({ alias: 'lcTooltip' });

  readonly placement = input<TooltipConfiguration['placement']>('vertical', { alias: 'lcTooltipPlacement' });
  readonly theme = input<TooltipConfiguration['theme']>(undefined, { alias: 'lcTooltipTheme' });
  readonly shouldShowWhenDisabled = input(false, { alias: 'lcTooltipShowWhenDisabled' });

  private readonly _hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef, { host: true });
  private readonly _tooltipService = inject(TooltipService);

  private _isLongPressing = false;
  private _tooltipRef?: TooltipRef;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender({
      write: () => {
        destroyRef.onDestroy(() => {
          this._tooltipService.hideAll();
        });

        if (isMobile()) {
          watchForLongPress(this._hostElementRef.nativeElement)
            .pipe(takeUntilDestroyed(destroyRef))
            .subscribe({
              next: event => {
                this._isLongPressing = true;
                this._showTooltip(event);
              }
            });
        }
      }
    });
  }

  private _showTooltip(event: MouseEvent | KeyboardEvent | PointerEvent) {
    event.stopPropagation();

    const tooltipAnchor = event.target as Element;

    // Only show the tooltip if the content is present and the anchor is not disabled
    // or if the tooltip should be shown when disabled
    if (
      this.content() &&
      (!('disabled' in tooltipAnchor) || !tooltipAnchor.disabled || this.shouldShowWhenDisabled())
    ) {
      this._tooltipRef = this._tooltipService.show(tooltipAnchor, {
        content: this.content(),
        placement: this.placement(),
        theme: this.theme()
      });
    }
  }

  private _hideTooltip(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();

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
    if (document.activeElement === this._hostElementRef.nativeElement) {
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
    if (this._isLongPressing && event.target !== this._hostElementRef.nativeElement) {
      this._hideTooltip(event);
    }
  }
}
