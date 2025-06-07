import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { TooltipDirective, TooltipService } from 'projects/angular-tooltip/src/public-api';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective],
  selector: 'lc-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly _tooltipService = inject(TooltipService);

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
    this._tooltipService.hideAll();
  }
}
