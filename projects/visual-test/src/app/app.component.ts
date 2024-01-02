import { Component, TemplateRef } from '@angular/core';
import { TooltipService } from 'projects/angular-tooltip/src/public-api';

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
      placement: 'vertical',
      theme: 'dark'
    });
  }

  onHideTooltip() {
    this._tooltipService.hide();
  }
}
