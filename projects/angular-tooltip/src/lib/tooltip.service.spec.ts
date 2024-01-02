import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { assertThat, delayBy } from '@babybeet/angular-testing-kit';

import { TooltipService } from './tooltip.service';
import { TooltipConfiguration } from './tooltip-configuration';

@Component({
  selector: 'bbb-test',
  template: `
    <ng-container></ng-container>
    <ng-template
      #templateRefContent
      let-name>
      <strong>Hello {{ name }}</strong>
    </ng-template>
  `
})
class TestBedComponent {
  @ViewChild('templateRefContent', { read: TemplateRef })
  readonly templateRefContent!: TemplateRef<unknown>;

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
    this._service.hide();
  }
}

describe(TooltipService.name, () => {
  const classSelectorPrefix = '.bbb-tooltip';
  let fixture: ComponentFixture<TestBedComponent>;
  let testBedComponent: TestBedComponent;
  let anchor: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestBedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestBedComponent);
    testBedComponent = fixture.componentInstance;
    fixture.detectChanges();
    anchor = document.createElement('button');
    document.body.appendChild(anchor);
  });

  afterEach(() => {
    document.body.removeChild(anchor);
    fixture.destroy();
  });

  it('Should render the provided string content correctly', async () => {
    testBedComponent.showTooltip(anchor, {
      content: 'Hello World'
    });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Hello World');
  });

  it('Should render the provided template ref content correctly', async () => {
    testBedComponent.showTooltip(anchor, {
      content: testBedComponent.templateRefContent,
      context: {
        $implicit: 'TemplateRef'
      }
    });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Hello TemplateRef');
  });

  it('Should render the provided component content correctly', async () => {
    @Component({
      selector: 'bbb-content',
      template: '<span>Hello @Component</span>'
    })
    class ContentComponent {}

    testBedComponent.showTooltip(anchor, {
      content: ContentComponent
    });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Hello @Component');
  });

  it('Should use light theme by default', async () => {
    testBedComponent.showTooltip(anchor);

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.light`).exists();
    assertThat(`${classSelectorPrefix}.dark`).doesNotExist();
  });

  it('Should be able to configure a different default theme', async () => {
    testBedComponent.showTooltip(anchor);

    fixture.detectChanges();

    await delayBy(1000);

    assertThat(`${classSelectorPrefix}.dark`).doesNotExist();
    assertThat(`${classSelectorPrefix}.light`).exists();

    testBedComponent.hideTooltip();

    await delayBy(1000);

    TooltipService.setDefaultTheme('dark');

    testBedComponent.showTooltip(anchor);

    fixture.detectChanges();

    await delayBy(1000);

    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
    assertThat(`${classSelectorPrefix}.dark`).exists();

    // Set back to the expected default
    TooltipService.setDefaultTheme('light');
  });

  it('Should render with the provided theme', async () => {
    testBedComponent.showTooltip(anchor, {
      theme: 'dark'
    });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
    assertThat(`${classSelectorPrefix}.dark`).exists();
  });

  it('Should add the provided class name', () => {
    testBedComponent.showTooltip(anchor, { className: 'hello-world' });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.hello-world`).exists();
  });

  it('Should be able to configure the placement', () => {
    testBedComponent.showTooltip(anchor, { placement: 'horizontal' });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.bottom`).doesNotExist();
    assertThat(`${classSelectorPrefix}.right`).exists();
  });

  it('#showAt() should show tooltip', () => {
    testBedComponent.showTooltipAt(0, 0, { content: 'Hello World' });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Hello World');
  });
});
