import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RestrictionPage } from './restriction.page';

describe('RestrictionPage', () => {
  let component: RestrictionPage;
  let fixture: ComponentFixture<RestrictionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RestrictionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
