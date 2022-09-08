import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LibrairyComponent } from './librairy.component';

describe('LibrairyComponent', () => {
  let component: LibrairyComponent;
  let fixture: ComponentFixture<LibrairyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrairyComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LibrairyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
