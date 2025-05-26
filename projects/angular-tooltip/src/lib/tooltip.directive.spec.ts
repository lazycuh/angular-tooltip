/* eslint-disable max-len */
import { ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { fireEvent, screen } from '@testing-library/angular';
import { delayBy, renderComponent } from 'projects/angular-tooltip/test/helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Placement } from './placement';
import { Theme } from './theme';
import { TooltipDirective } from './tooltip.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective],
  selector: 'lc-test',
  template: `
    <button
      #button
      type="button"
      [disabled]="disabled()"
      [lcTooltip]="content()"
      [lcTooltipPlacement]="placement()"
      [lcTooltipShowWhenDisabled]="shouldShowWhenDisabled()"
      [lcTooltipTheme]="theme()">
      Hover me
    </button>
  `
})
class TestBedComponent {
  readonly content = signal('Hello World');
  readonly placement = signal<Placement>('vertical');
  readonly theme = signal<Theme>('light');
  readonly disabled = signal(false);
  readonly shouldShowWhenDisabled = signal(false);

  @ViewChild('button', { read: ElementRef })
  readonly buttonRef!: ElementRef<HTMLButtonElement>;

  dispatchEvent<T extends keyof HTMLElementEventMap = keyof HTMLElementEventMap>(
    eventType: T,
    eventDetail?: CustomEventInit<HTMLElementEventMap[T]>['detail']
  ) {
    const customEvent = new CustomEvent(eventType, eventDetail);
    this.buttonRef.nativeElement.dispatchEvent(customEvent);
  }
}

describe(TooltipDirective.name, () => {
  const classSelectorPrefix = '.lc-tooltip';
  let testBedComponent: TestBedComponent;

  beforeEach(async () => {
    const renderResult = await renderComponent(TestBedComponent);
    testBedComponent = renderResult.fixture.componentInstance;
  });

  it('Should render the provided content properly', async () => {
    testBedComponent.content.set('Hello TooltipDirective');
    await delayBy(16);

    testBedComponent.dispatchEvent('pointerover');

    expect(screen.getByText('Hello TooltipDirective')).toBeInTheDocument();
  });

  it('Should render with the provided placement properly', async () => {
    testBedComponent.placement.set('horizontal');
    await delayBy(16);

    testBedComponent.dispatchEvent('pointerover');

    expect(document.body.querySelector('.bottom-anchored')).not.toBeInTheDocument();
    expect(document.body.querySelector('.right-anchored')).toBeInTheDocument();
  });

  it('Should render with the provided theme properly', async () => {
    testBedComponent.theme.set('dark');
    await delayBy(16);

    testBedComponent.dispatchEvent('pointerover');

    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).toBeInTheDocument();
  });

  it('Should show tooltip on pointerover', async () => {
    testBedComponent.dispatchEvent('pointerover');

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('Should hide tooltip on pointerout', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('chrome');

    testBedComponent.dispatchEvent('pointerover');

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();

    testBedComponent.dispatchEvent('pointerout');

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.is-leaving`)).toBeInTheDocument();
  });

  it('Should show tooltip when the target element has keyboard focus', async () => {
    testBedComponent.buttonRef.nativeElement.focus();
    testBedComponent.dispatchEvent('keyup');

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('Should hide tooltip when the target element loses keyboard focus', async () => {
    testBedComponent.buttonRef.nativeElement.focus();
    testBedComponent.dispatchEvent('keyup');

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();

    testBedComponent.buttonRef.nativeElement.blur();

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.is-leaving`)).toBeInTheDocument();
  });

  it('Should not show tooltip when the anchor element is disabled and the `lcTooltipShowWhenDiabled` is not true', async () => {
    testBedComponent.content.set('Hello TooltipDirective');
    testBedComponent.disabled.set(true);

    await delayBy(16);

    testBedComponent.dispatchEvent('pointerover');

    await delayBy(16);

    expect(screen.queryByText('Hello TooltipDirective')).not.toBeInTheDocument();
  });

  it('Should show tooltip when the anchor element is disabled and the `lcTooltipShowWhenDiabled` is true', async () => {
    testBedComponent.content.set('Hello TooltipDirective');
    testBedComponent.disabled.set(true);
    testBedComponent.shouldShowWhenDisabled.set(true);

    await delayBy(16);

    testBedComponent.dispatchEvent('pointerover');

    await delayBy(16);

    expect(screen.getByText('Hello TooltipDirective')).toBeInTheDocument();
  });

  it('Should not show tooltip when the tooltip content is empty', async () => {
    testBedComponent.content.set('');

    await delayBy(16);

    testBedComponent.dispatchEvent('pointerover');

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}__content`)).not.toBeInTheDocument();
  });
});

describe(`${TooltipDirective.name} on mobile`, () => {
  it('Should show tooltip on long presses on mobile only', async () => {
    vi.useFakeTimers();
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Android');

    const renderResult = await renderComponent(TestBedComponent);
    const testBedComponent = renderResult.fixture.componentInstance;

    testBedComponent.dispatchEvent('pointerdown');

    await vi.advanceTimersByTimeAsync(1000);

    expect(screen.getByText('Hello World')).toBeInTheDocument();

    expect(document.body.querySelector('.lc-tooltip.is-leaving')).not.toBeInTheDocument();

    vi.useRealTimers();

    fireEvent(window, new CustomEvent('pointerup'));
    await delayBy(16);

    expect(document.body.querySelector('.lc-tooltip.is-leaving')).toBeInTheDocument();
  });
});
