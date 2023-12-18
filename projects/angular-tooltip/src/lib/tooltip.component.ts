import { AfterViewInit, Component, ElementRef, Host, OnDestroy, ViewEncapsulation } from '@angular/core';

import { Placement } from './placement';
import { Theme } from './theme';

@Component({
  encapsulation: ViewEncapsulation.None,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'bbb-tooltip-container'
  },
  selector: 'bbb-tooltip',
  standalone: true,
  styleUrls: ['./tooltip.component.scss'],
  templateUrl: './tooltip.component.html'
})
export class TooltipComponent implements AfterViewInit, OnDestroy {
  /**
   * @private To be used by template
   */
  _content = '';

  /**
   * @private To be used by template
   */
  _placement = Placement.VERTICAL;

  /**
   * @private To be used by template
   */
  _isVisible = false;

  /**
   * @private To be used by template
   */
  _idForAriaDescribedBy = `__${btoa(String(Math.random() + Math.random()))
    .substring(5, 15)
    .toLowerCase()}__`;

  /**
   * Optional class to add to this component
   *
   * @private To be used by template
   */
  _className?: string;

  /**
   * The current theme for this tooltip.
   *
   * @private To be used by template
   */
  _theme: Theme = Theme.LIGHT;

  /**
   * The DOM element representing this tooltip
   */
  private _tooltip!: HTMLDivElement;

  /**
   * The callback to run after this tooltip is closed
   */
  private _afterClosedListener?: () => void;

  constructor(@Host() private readonly _host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    if (![Placement.HORIZONTAL, Placement.VERTICAL].includes(this._placement)) {
      throw new Error(`Invalid tooltip placement: ${this._placement}`);
    }

    this._tooltip = this._host.nativeElement.firstElementChild as HTMLDivElement;
  }

  hide() {
    this._isVisible = false;
  }

  ngOnDestroy() {
    this._afterClosedListener = undefined;
  }

  addClassName(className: string) {
    this._className = className;
  }

  setTheme(theme: Theme) {
    this._theme = theme;
  }

  setAfterClosedListener(listener: () => void) {
    this._afterClosedListener = listener;
  }

  setPlacement(placement: Placement) {
    this._placement = placement;
  }

  /**
   * Show a tooltip anchored at `anchor` with the provided content.
   *
   * @param anchor The target at which to place this tooltip.
   * @param content The tooltip content to show.
   */
  show(anchor: Element, content: Element) {
    anchor.setAttribute('aria-describedby', this._idForAriaDescribedBy);
    this._showTooltip(anchor.getBoundingClientRect(), content);
  }

  private _showTooltip(anchorBoundingBox: Omit<DOMRect, 'toJSON'>, content: Element) {
    this._isVisible = true;
    this._tooltip.querySelector('.bbb-tooltip__content')?.appendChild(content);

    switch (this._placement) {
      case Placement.VERTICAL:
        this._showBottom(anchorBoundingBox);
        break;
      case Placement.HORIZONTAL:
        this._showRight(anchorBoundingBox);
        break;
    }
  }

  private _showBottom(anchorBoundingBox: Omit<DOMRect, 'toJSON'>) {
    this._tooltip.classList.add('bottom');

    setTimeout(() => {
      const tooltipBoundingBox = this._tooltip.getBoundingClientRect();
      const arrowHeight = 15;
      const spaceBetweenArrowAndAnchor = 10;
      // The tooltip will be placed centered horizontally with the anchor.
      const tooltipLeft = anchorBoundingBox.left + (anchorBoundingBox.width - tooltipBoundingBox.width) / 2;
      let tooltipTop = anchorBoundingBox.bottom + spaceBetweenArrowAndAnchor;
      const isOverflowingBottomEdgeOfViewport =
        tooltipTop + arrowHeight + tooltipBoundingBox.height + spaceBetweenArrowAndAnchor >= window.innerHeight;

      /**
       * If the tooltip overflows the bottom of the viewport, we want to shift the tooltip to the top of the anchor,
       * but if this shifting causes the tooltip to overflow the top of the viewport which is when `tooltipTop`
       * is negative, then we want to limit the height of the tooltip to the distance between the anchor's top
       * position and the viewport's top edge minus some spacing.
       */
      if (isOverflowingBottomEdgeOfViewport) {
        tooltipTop = anchorBoundingBox.top - tooltipBoundingBox.height - spaceBetweenArrowAndAnchor;

        if (tooltipTop < 0) {
          const newTooltipHeight = anchorBoundingBox.top - spaceBetweenArrowAndAnchor * 1.5;

          this._tooltip.style.height = `${newTooltipHeight}px`;
          tooltipTop = spaceBetweenArrowAndAnchor / 2;
        }

        this._tooltip.classList.remove('bottom');
        this._tooltip.classList.add('top');
      } else {
        /**
         * If the tooltip overflows the bottom edge of viewport, we want to shrink
         * its height by the amount of overflowing distance and some spacing.
         */
        // const effectiveTooltipBottom = tooltipTop + tooltipBoundingBox.height;
        // const differenceBetweenTooltipBottomAndViewportBottom = effectiveTooltipBottom - window.innerHeight;
        // if (differenceBetweenTooltipBottomAndViewportBottom > 0) {
        //   const newTooltipHeight =
        //     tooltipBoundingBox.height -
        //     differenceBetweenTooltipBottomAndViewportBottom -
        //     spaceBetweenArrowAndAnchor / 2;
        //   this._tooltip.style.height = `${newTooltipHeight}px`;
        // }
      }

      const horizontalDifference =
        this._calculateRightEdgeOverflowingDistance(tooltipLeft, tooltipBoundingBox.width) ||
        this._calculateLeftEdgeOverflowingDistance(tooltipLeft);
      this._tooltip.style.left = `${tooltipLeft - horizontalDifference}px`;
      this._tooltip.style.top = `${tooltipTop}px`;
    }, 0);
  }

  /**
   * Returns a value greater than 0 for the overflowing distance
   * if tooltip box overflows the right edge of the screen, 0 otherwise
   */
  private _calculateRightEdgeOverflowingDistance(left: number, width: number) {
    const spacing = 5;
    const difference = left + width - window.innerWidth + spacing;

    if (difference > spacing) {
      (this._tooltip.querySelector('.bbb-tooltip__arrow') as HTMLElement).style.left = `calc(50% + ${difference}px)`;
      return difference;
    }
    return 0;
  }

  /**
   * Returns a value greater than 0 for the overflowing distance
   * if tooltip box overflows the left edge of the screen, 0 otherwise
   */
  private _calculateLeftEdgeOverflowingDistance(left: number) {
    if (left < 0) {
      const spacing = 5;
      const newLeft = `calc(50% - ${Math.abs(left) + spacing}px)`;

      (this._tooltip.querySelector('.bbb-tooltip__arrow') as HTMLElement).style.left = newLeft;

      return left - spacing;
    }
    return 0;
  }

  private _showRight(anchorBoundingBox: Omit<DOMRect, 'toJSON'>) {
    this._tooltip.classList.add('right');

    setTimeout(() => {
      const tooltipBoundingBox = this._tooltip.getBoundingClientRect();
      const spaceBetweenArrowAndAnchor = 10;
      const arrowWidth = 15;
      // The tooltip will be placed centered vertically with the anchor.
      const tooltipTop = anchorBoundingBox.top + (anchorBoundingBox.height - tooltipBoundingBox.height) / 2;
      let tooltipLeft = anchorBoundingBox.right + 10;

      const isOverflowingRightEdgeOfViewport =
        anchorBoundingBox.right + arrowWidth + tooltipBoundingBox.width + spaceBetweenArrowAndAnchor >=
        window.innerWidth;

      /**
       * If the tooltip overflows the right edge of the viewport, we want to shift the tooltip to the left
       * of the anchor, but if this shifting causes the tooltip to overflow the left edge of the viewport
       * which is when `tooltipLeft` is negative, then we want to limit the width of the tooltip to
       * the distance between the anchor's left position and the viewport's left edge minus some spacing.
       */
      if (isOverflowingRightEdgeOfViewport) {
        tooltipLeft = anchorBoundingBox.left - tooltipBoundingBox.width - spaceBetweenArrowAndAnchor;

        if (tooltipLeft < 0) {
          const newTooltipWidth = anchorBoundingBox.left - spaceBetweenArrowAndAnchor * 1.5;

          this._tooltip.style.width = `${newTooltipWidth}px`;
          tooltipLeft = spaceBetweenArrowAndAnchor / 2;
        }

        this._tooltip.classList.remove('right');
        this._tooltip.classList.add('left');
      } else {
        /**
         * If the tooltip overflows the right edge of viewport, we want to shrink
         * its width by the amount of overflowing distance and some spacing.
         */
        const effectiveTooltipRight = tooltipLeft + tooltipBoundingBox.width;
        const differenceBetweenTooltipRightAndViewportRight = effectiveTooltipRight - window.innerWidth;

        if (differenceBetweenTooltipRightAndViewportRight > 0) {
          const newTooltipWidth =
            tooltipBoundingBox.width - differenceBetweenTooltipRightAndViewportRight - spaceBetweenArrowAndAnchor / 2;
          this._tooltip.style.width = `${newTooltipWidth}px`;
        }
      }

      const horizontalDifference =
        this._calculateRightEdgeOverflowingDistance(tooltipLeft, tooltipBoundingBox.width) ||
        this._calculateLeftEdgeOverflowingDistance(tooltipLeft);
      this._tooltip.style.left = `${tooltipLeft - horizontalDifference}px`;
      this._tooltip.style.top = `${tooltipTop}px`;
    }, 0);
  }

  /**
   * @private To be used by template
   */
  _onAnimationDone() {
    if (!this._isVisible && this._afterClosedListener) {
      this._afterClosedListener();
    }
  }

  /**
   * Show a tooltip at the specified x/y location.
   */
  showAt(x: number, y: number, content: Element) {
    const anchorBoundingBox: Omit<DOMRect, 'toJSON'> = {
      bottom: y + 1,
      height: 1,
      left: x,
      right: x + 1,
      top: y,
      width: 1,
      x,
      y
    };

    this._showTooltip(anchorBoundingBox, content);
  }
}
