import { TooltipComponent } from './tooltip.component';

export class TooltipRef {
  constructor(private readonly _tooltipInstance: TooltipComponent) {}

  hide() {
    this._tooltipInstance.hide();
  }
}
