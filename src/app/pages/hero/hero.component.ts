import { UpperCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';


@Component({
  selector: 'app-hero',
  imports: [UpperCasePipe,],
  templateUrl: './hero.component.html'
})
export class HeroComponent {

  name= signal("Ironman");
  age= signal(45);


  //como deberia ser

  heroDescription = computed(()=>{
      const description = `${this.name()} - ${this.age()}`;
      return description;
  })
  
  
  getHeroDescription(){
      return `${this.name()} - ${this.age()}`;
  }

  changeHero(){
      this.name.set('Spiderman');
      this.age.set(22);
  }

  resetForm(){
      this.name.set('Ironman');
      this.age.set(45);
  }

  changeAge(){
      this.age.set(22);
  }

  capitalizar(){
      return this.name().toUpperCase();
  }


  capitalizedName = computed (() => {
      const capitalizado = this.name().toUpperCase();
      return capitalizado;
  })


}
