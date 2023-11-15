import { Component, TemplateRef } from '@angular/core';
import { Placement } from 'projects/angular-tooltip/src/lib/placement';
import { Theme, TooltipService } from 'projects/angular-tooltip/src/public-api';

@Component({
  selector: 'bbb-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private readonly _tooltipService: TooltipService) {}

  onShowTooltip(button: HTMLButtonElement, templateRefContent: TemplateRef<unknown>) {
    this._tooltipService.show(button, {
      content: templateRefContent,
      context: {
        $implicit: 'TemplateRef'
      },
      placement: Placement.VERTICAL,
      theme: Theme.DARK
    });
  }

  onHideTooltip() {
    this._tooltipService.hide();
  }
}
