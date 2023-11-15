import { ApplicationRef, ComponentRef, createComponent, Injectable, TemplateRef } from '@angular/core';

import { Theme } from './theme';
import { TooltipComponent } from './tooltip.component';
import { TooltipConfiguration } from './tooltip-configuration';

/**
 * This class allows to programmatically show a tooltip anchored at an element.
 * See {@see TooltipConfiguration} for the different options to configure the tooltip.
 * Please note that even though this class can create as many tooltips as desired,
 * it's only able to close the last opened tooltip.
 */
@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  private static _defaultTheme = Theme.LIGHT;

  private _tooltipRef: ComponentRef<TooltipComponent> | null = null;

  constructor(private readonly _applicationRef: ApplicationRef) {}

  /**
   * Set the default theme that will be used for all tooltip created in the future.
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
    const createdTooltipContent = this._prepareTooltip(configuration);

    this._tooltipRef?.instance.show(anchor, createdTooltipContent.rootNode);
  }

  private _prepareTooltip(configuration: TooltipConfiguration) {
    const tooltipRef = createComponent(TooltipComponent, {
      environmentInjector: this._applicationRef.injector
    });

    const createdContent = this._createContent(configuration);

    this._applicationRef.attachView(tooltipRef.hostView);

    tooltipRef.changeDetectorRef.detectChanges();

    if (configuration.className) {
      tooltipRef.instance.addClassName(configuration.className);
    }

    if (configuration.placement) {
      tooltipRef.instance.setPlacement(configuration.placement);
    }

    tooltipRef.instance.setTheme(configuration.theme || TooltipService._defaultTheme);

    tooltipRef.instance.setAfterClosedListener(() => {
      this._applicationRef.detachView(tooltipRef.hostView);
      tooltipRef.destroy();
      createdContent.ref?.destroy();
    });

    document.body.appendChild(tooltipRef.location.nativeElement);

    this._tooltipRef = tooltipRef;

    return createdContent;
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
        rootNode: embeddedView.rootNodes.reduce((contentRoot: Element, next) => {
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
    const createdTooltipContent = this._prepareTooltip(configuration);

    this._tooltipRef?.instance.showAt(x, y, createdTooltipContent.rootNode);
  }

  /**
   * Hide the last opened tooltip.
   */
  hide() {
    this._tooltipRef?.instance.hide();
  }
}
