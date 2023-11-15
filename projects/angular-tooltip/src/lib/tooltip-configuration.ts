import { TemplateRef, Type } from '@angular/core';

import { Placement } from './placement';
import { Theme } from './theme';

/**
 * The configuration object for the current tooltip. The type parameter `C` describes
 * the type of the optional context object passed to `TemplateRef<C>`.
 */
export interface TooltipConfiguration<C extends Record<string, unknown> | unknown = unknown> {
  /**
   * The optional class name to add to this tooltip.
   */
  className?: string;

  /**
   * The required content to show, it accepts a `TemplateRef`, a `@Component()` class, or a string.
   */
  content: TemplateRef<C> | Type<unknown> | string;

  /**
   * The optional context object that is referenced by the template ref.
   */
  context?: C;

  /**
   * Where to position the tooltip. Default is {@link Placement.VERTICAL}.
   */
  placement?: Placement;

  /**
   * The optional theme for this tooltip. Default is {@link Theme.LIGHT Theme.LIGHT}.
   */
  theme?: Theme;
}
