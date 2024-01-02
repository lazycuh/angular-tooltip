import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { assertThat } from '@babybeet/angular-testing-kit';

import { TooltipComponent } from './tooltip.component';

describe(TooltipComponent.name, () => {
  const classPrefix = '.bbb-tooltip';
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  let debugElement: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TooltipComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('Should render the provided content correctly', () => {
    const content = document.createElement('span');

    content.innerHTML = 'Hello World';
    component.show(document.createElement('button'), content);
    fixture.detectChanges();

    assertThat(debugElement.query(By.css(`${classPrefix}__content`))).hasInnerHtml('<span>Hello World</span>');
    assertThat(debugElement.query(By.css(`${classPrefix}__content`))).hasTextContent('Hello World');
  });

  it('Should be placed at the bottom of anchor element by default', fakeAsync(() => {
    component.show(document.createElement('button'), document.createElement('div'));
    fixture.detectChanges();
    tick();

    assertThat(debugElement.query(By.css('.top'))).doesNotExist();
    assertThat(debugElement.query(By.css('.bottom'))).exists();
  }));

  it('Should be placed at the top of the anchor if it overflows the bottom edge of the viewport', fakeAsync(() => {
    const anchor = document.createElement('button');

    anchor.setAttribute('style', ['position:fixed', 'bottom:0'].join(';'));
    document.body.appendChild(anchor);
    component.show(anchor, document.createElement('span'));
    fixture.detectChanges();
    tick();

    assertThat(debugElement.query(By.css('.bottom'))).doesNotExist();
    assertThat(debugElement.query(By.css('.top'))).exists();
  }));

  it('Should use light theme by default', () => {
    component.show(document.createElement('button'), document.createElement('span'));

    fixture.detectChanges();

    assertThat(debugElement.query(By.css('.light'))).exists();
  });

  it('Should be placed at the right of anchor element if placement is horizontal', fakeAsync(() => {
    component.setPlacement('horizontal');
    component.show(document.createElement('button'), document.createElement('div'));
    fixture.detectChanges();
    tick();

    assertThat(debugElement.query(By.css('.left'))).doesNotExist();
    assertThat(debugElement.query(By.css('.right'))).exists();
  }));

  it('Should be placed at the left of the anchor if it overflows the right edge of the viewport', fakeAsync(() => {
    const anchor = document.createElement('button');
    anchor.setAttribute('style', ['position:fixed', 'right:0'].join(';'));
    document.body.appendChild(anchor);

    component.setPlacement('horizontal');
    component.show(anchor, document.createElement('span'));
    fixture.detectChanges();
    tick();

    assertThat(debugElement.query(By.css('.right'))).doesNotExist();
    assertThat(debugElement.query(By.css('.left'))).exists();
  }));

  it('#showAt() should show tooltip', fakeAsync(() => {
    const content = document.createElement('span');

    content.innerHTML = 'Hello World';
    component.showAt(10, 10, content);

    fixture.detectChanges();

    tick();

    assertThat(debugElement.query(By.css(`${classPrefix}__content`))).hasTextContent('Hello World');
  }));
});
