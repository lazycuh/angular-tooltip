import { ApplicationRef, createComponent, Injectable, TemplateRef } from '@angular/core';

import { Theme } from './theme';
import { TooltipComponent } from './tooltip.component';
import { TooltipConfiguration } from './tooltip-configuration';

/**
 * This class allows to programmatically show a tooltip anchored at an element.
 * See {@see TooltipConfiguration} for the different options to configure the tooltip.
 * Please note that even though this class can create as many tooltips as desired,
 * it cannot selectively close a tooltip, it can only close all currently opened tooltips.
 */
@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  private static _defaultTheme: Theme = 'light';

  private readonly _openedTooltips = new Set<TooltipComponent>();

  constructor(private readonly _applicationRef: ApplicationRef) {}

  /**
   * Set the default theme that will be used for all tooltips created in the future.
   *
   * @param theme The new theme to be used as the default.
   */
  static setDefaultTheme(theme: Theme) {
    TooltipService._defaultTheme = theme;
  }

  /**
   * Show a tooltip anchored at `anchor` with a configuration object specified by `configuration`.
   * Ensure that the last opened tooltip has been closed before calling this method.
   *
   * @param anchor The target at which to place the tooltip.
   * @param configuration The configuration object for this tooltip instance.
   */
  show(anchor: Element, configuration: TooltipConfiguration) {
    const result = this._prepareTooltip(configuration);

    result.tooltipRef.instance.show(anchor, result.content.rootNode);

    this._openedTooltips.add(result.tooltipRef.instance);
  }

  private _prepareTooltip(configuration: TooltipConfiguration) {
    const tooltipRef = createComponent(TooltipComponent, {
      environmentInjector: this._applicationRef.injector
    });

    const createdContent = this._createContent(configuration);

    if (configuration.className) {
      tooltipRef.instance.setClassName(configuration.className);
    }

    if (configuration.placement) {
      tooltipRef.instance.setPlacement(configuration.placement);
    }

    tooltipRef.instance.setTheme(configuration.theme ?? TooltipService._defaultTheme);

    tooltipRef.instance.setAfterClosedListener(() => {
      this._applicationRef.detachView(tooltipRef.hostView);
      tooltipRef.destroy();
      createdContent.ref?.destroy();
    });

    this._applicationRef.attachView(tooltipRef.hostView);

    tooltipRef.changeDetectorRef.detectChanges();

    document.body.appendChild(tooltipRef.location.nativeElement);

    return {
      content: createdContent,
      tooltipRef
    };
  }

  private _createContent(configuration: TooltipConfiguration) {
    if (typeof configuration.content === 'string') {
      const contentRoot: Element = document.createElement('div');
      contentRoot.innerHTML = configuration.content;

      return {
        ref: null,
        rootNode: contentRoot
      };
    }

    if (configuration.content instanceof TemplateRef) {
      const embeddedView = configuration.content.createEmbeddedView(configuration.context || {});

      this._applicationRef.attachView(embeddedView);

      return {
        ref: embeddedView,
        /**
         * If the markups inside the provided template ref aren't being wrapped inside
         * a containing DOM element, then there will be multiple root nodes, in this case,
         * we want to add them all as the content by appending them to a document fragment
         */
        rootNode: (embeddedView.rootNodes as Element[]).reduce((contentRoot, next) => {
          contentRoot.appendChild(next);

          return contentRoot;
        }, document.createDocumentFragment())
      };
    }

    const componentRef = createComponent(configuration.content, { environmentInjector: this._applicationRef.injector });

    this._applicationRef.attachView(componentRef.hostView);

    return {
      ref: componentRef,
      rootNode: componentRef.location.nativeElement as Element
    };
  }

  /**
   * Show a tooltip anchored at the provided x/y coordinates with a configuration object specified by `configuration`.
   * Ensure that the last opened tooltip has been closed before calling this method.
   *
   * @param x The x coordinate to place the tooltip.
   * @param y The y coordinate to place the tooltip.
   * @param configuration The configuration object for this tooltip instance.
   */
  showAt(x: number, y: number, configuration: TooltipConfiguration) {
    const result = this._prepareTooltip(configuration);

    result.tooltipRef.instance.showAt(x, y, result.content.rootNode);

    this._openedTooltips.add(result.tooltipRef.instance);
  }

  /**
   * Hide all opened tooltips.
   */
  hide() {
    for (const openedTooltip of this._openedTooltips) {
      openedTooltip.hide();
    }

    this._openedTooltips.clear();
  }
}
