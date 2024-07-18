import { TemplateRef, Type } from '@angular/core';

import { Placement } from './placement';
import { Theme } from './theme';

/**
 * The configuration object for the current tooltip..
 */
export interface TooltipConfiguration {
  /**
   * The optional class name to add to this tooltip.
   */
  className?: string;

  /**
   * The required content to show, it accepts a `TemplateRef`, a `@Component()` class, or a string.
   */
  content: TemplateRef<unknown> | Type<unknown> | string;

  /**
   * The optional context object that is referenced by the template ref.
   */
  context?: unknown;

  /**
   * Where to position the tooltip. Default is `vertical`.
   */
  placement?: Placement;

  /**
   * The optional theme for this tooltip. Default is `light`.
   */
  theme?: Theme;
}
