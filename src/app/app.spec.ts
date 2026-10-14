import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render tasks title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Mes tâches');
  });

  it('should reject empty new task', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.newTitle.set('   ');
    await app.add();
    expect(app.formError()).toContain('Écris un titre');
  });
});
