import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoMissedPage } from './info-missed.page';

describe('InfoMissedPage', () => {
  let component: InfoMissedPage;
  let fixture: ComponentFixture<InfoMissedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoMissedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoMissedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
