import { ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { screen } from '@testing-library/angular';
import { delayBy, renderComponent } from 'projects/angular-tooltip/test/helpers';
import { beforeEach, describe, expect, it } from 'vitest';

import { TooltipService } from './tooltip.service';
import { TooltipConfiguration } from './tooltip-configuration';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lc-test',
  standalone: true,
  template: `
    <ng-container />
    <ng-template
      #templateRefContent
      let-name>
      <strong>Hello {{ name }}</strong>
    </ng-template>
  `
})
class TestBedComponent {
  readonly templateRefContent = viewChild.required('templateRefContent', { read: TemplateRef });

  constructor(private readonly _service: TooltipService) {}

  showTooltip(anchor: Element, config: Partial<TooltipConfiguration> = {}) {
    this._service.show(anchor, {
      content: 'This is a tooltip',
      ...config
    });
  }

  showTooltipAt(x: number, y: number, config: Partial<TooltipConfiguration> = {}) {
    this._service.showAt(x, y, {
      content: 'This is a tooltip',
      ...config
    });
  }

  hideTooltip() {
    this._service.hideAll();
  }
}

describe(TooltipService.name, () => {
  const classSelectorPrefix = '.lc-tooltip';
  let testBedComponent: TestBedComponent;
  let anchor: HTMLElement;

  beforeEach(async () => {
    const renderResult = await renderComponent(TestBedComponent);
    testBedComponent = renderResult.fixture.componentInstance;
    anchor = document.createElement('button');
    document.body.appendChild(anchor);
  });

  it('Should render the provided string content correctly', async () => {
    testBedComponent.showTooltip(anchor, {
      content: 'Hello World'
    });

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('Should render the provided template ref content correctly', async () => {
    testBedComponent.showTooltip(anchor, {
      content: testBedComponent.templateRefContent(),
      context: {
        $implicit: 'TemplateRef'
      }
    });

    await delayBy(16);

    expect(screen.getByText('Hello TemplateRef')).toBeInTheDocument();
  });

  it('Should render the provided component content correctly', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      selector: 'lc-content',
      standalone: true,
      template: '<span>Hello {{"@"}}Component</span>'
    })
    class ContentComponent {}

    testBedComponent.showTooltip(anchor, {
      content: ContentComponent
    });

    await delayBy(16);

    expect(screen.getByText('Hello @Component')).toBeInTheDocument();
  });

  it('Should use light theme by default', async () => {
    testBedComponent.showTooltip(anchor);

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).toBeInTheDocument();
  });

  it('Should be able to configure a different default theme', async () => {
    testBedComponent.showTooltip(anchor);

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).toBeInTheDocument();

    testBedComponent.hideTooltip();

    await delayBy(16);

    TooltipService.setDefaultTheme('dark');

    testBedComponent.showTooltip(anchor);

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme.is-leaving`)).toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).toBeInTheDocument();

    // Set back to the expected default
    TooltipService.setDefaultTheme('light');
  });

  it('Should render with the provided theme', async () => {
    testBedComponent.showTooltip(anchor, {
      theme: 'dark'
    });

    await delayBy(500);

    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).toBeInTheDocument();
  });

  it('Should add the provided class name', async () => {
    testBedComponent.showTooltip(anchor, { className: 'hello-world' });

    await delayBy(500);

    expect(document.body.querySelector(`${classSelectorPrefix}.hello-world`)).toBeInTheDocument();
  });

  it('Should be able to configure the placement', async () => {
    testBedComponent.showTooltip(anchor, { placement: 'horizontal' });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.bottom-anchored`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.right-anchored`)).toBeInTheDocument();
  });

  it('#showAt() should show tooltip', async () => {
    testBedComponent.showTooltipAt(0, 0, { content: 'Hello World' });

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
