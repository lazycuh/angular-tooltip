import { screen } from '@testing-library/angular';
import { delayBy, renderComponent } from 'projects/angular-tooltip/test/helpers';
import { beforeEach, describe, expect, it } from 'vitest';

import { TooltipComponent } from './tooltip.component';

describe(TooltipComponent.name, () => {
  const classPrefix = '.lc-tooltip';
  let component: TooltipComponent;
  let anchor: HTMLElement;

  beforeEach(async () => {
    const renderResult = await renderComponent(TooltipComponent);
    component = renderResult.fixture.componentInstance;
    anchor = document.createElement('button');
    document.body.appendChild(anchor);
  });

  it('Should render the provided content correctly', async () => {
    const content = document.createElement('span');

    content.innerHTML = 'Hello World';
    component.show(anchor, content);

    await delayBy(300);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(document.body.querySelector(`${classPrefix}__content`)!.innerHTML).toEqual('<span>Hello World</span>');
  });

  it('Should be placed at the bottom of anchor element by default', async () => {
    component.show(anchor, anchor);

    await delayBy(300);

    expect(document.body.querySelector('.top-anchored')).not.toBeInTheDocument();
    expect(document.body.querySelector('.bottom-anchored')).toBeInTheDocument();
  });

  // Skipped for now because happy-dom does not support the getBoundingClientRect method
  // eslint-disable-next-line vitest/no-disabled-tests
  it.skip('Should be placed at the top of the anchor if it overflows the bottom edge of the viewport', async () => {
    anchor.setAttribute('style', ['position:fixed', 'bottom:0'].join(';'));
    component.show(anchor, document.createElement('span'));

    await delayBy(300);

    expect(document.body.querySelector('.bottom-anchored')).not.toBeInTheDocument();
    expect(document.body.querySelector('.top-anchored')).toBeInTheDocument();
  });

  it('Should use light theme by default', async () => {
    component.show(anchor, anchor);

    await delayBy(300);

    expect(document.body.querySelector('.light-theme')).toBeInTheDocument();
  });

  it('Should be placed at the right of anchor element if placement is horizontal', async () => {
    component.setPlacement('horizontal');
    component.show(anchor, anchor);

    await delayBy(300);

    expect(document.body.querySelector('.left-anchored')).not.toBeInTheDocument();
    expect(document.body.querySelector('.right-anchored')).toBeInTheDocument();
  });

  // Skipped for now because happy-dom does not support the getBoundingClientRect method
  // eslint-disable-next-line vitest/no-disabled-tests
  it.skip('Should be placed at the left of the anchor if it overflows the right edge of the viewport', async () => {
    anchor.setAttribute('style', ['position:fixed', 'right:0'].join(';'));
    document.body.appendChild(anchor);

    component.setPlacement('horizontal');
    component.show(anchor, anchor);

    await delayBy(1000);

    expect(document.body.querySelector('.right-anchored')).not.toBeInTheDocument();
    expect(document.body.querySelector('.left-anchored')).toBeInTheDocument();
  });

  it('#showAt() should show tooltip', async () => {
    const content = document.createElement('span');

    const contextText = `Hello World${Math.random()}`;

    content.innerHTML = contextText;
    component.showAt(10, 10, content);

    await delayBy(300);

    expect(screen.getByText(contextText)).toBeInTheDocument();
  });
});
