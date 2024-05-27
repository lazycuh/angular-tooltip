import { DebugElement, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { assertThat, delayBy } from '@babybeet/angular-testing-kit';

import { TooltipComponent } from './tooltip.component';

describe(TooltipComponent.name, () => {
  const classPrefix = '.lc-tooltip';
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  let debugElement: DebugElement;
  let anchor: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
    anchor = document.createElement('button');
    document.body.appendChild(anchor);
  });

  it('Should render the provided content correctly', async () => {
    const content = document.createElement('span');

    content.innerHTML = 'Hello World';
    component.show(anchor, content);

    await delayBy(16);

    assertThat(debugElement.query(By.css(`${classPrefix}__content`))).hasInnerHtml('<span>Hello World</span>');
    assertThat(debugElement.query(By.css(`${classPrefix}__content`))).hasTextContent('Hello World');
  });

  it('Should be placed at the bottom of anchor element by default', async () => {
    component.show(anchor, anchor);

    await delayBy(16);

    assertThat(debugElement.query(By.css('.top'))).doesNotExist();
    assertThat(debugElement.query(By.css('.bottom'))).exists();
  });

  it('Should be placed at the top of the anchor if it overflows the bottom edge of the viewport', async () => {
    anchor.setAttribute('style', ['position:fixed', 'bottom:0'].join(';'));
    component.show(anchor, document.createElement('span'));

    await delayBy(16);

    assertThat(debugElement.query(By.css('.bottom'))).doesNotExist();
    assertThat(debugElement.query(By.css('.top'))).exists();
  });

  it('Should use light theme by default', async () => {
    component.show(anchor, anchor);

    await delayBy(16);

    assertThat(debugElement.query(By.css('.light'))).exists();
  });

  it('Should be placed at the right of anchor element if placement is horizontal', async () => {
    component.setPlacement('horizontal');
    component.show(anchor, anchor);

    await delayBy(50);

    assertThat(debugElement.query(By.css('.left'))).doesNotExist();
    assertThat(debugElement.query(By.css('.right'))).exists();
  });

  it('Should be placed at the left of the anchor if it overflows the right edge of the viewport', async () => {
    anchor.setAttribute('style', ['position:fixed', 'right:0'].join(';'));
    document.body.appendChild(anchor);

    component.setPlacement('horizontal');
    component.show(anchor, anchor);

    await delayBy(16);

    assertThat(debugElement.query(By.css('.right'))).doesNotExist();
    assertThat(debugElement.query(By.css('.left'))).exists();
  });

  it('#showAt() should show tooltip', async () => {
    const content = document.createElement('span');

    content.innerHTML = 'Hello World';
    component.showAt(10, 10, content);

    await delayBy(16);

    assertThat(debugElement.query(By.css(`${classPrefix}__content`))).hasTextContent('Hello World');
  });
});
