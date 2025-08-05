import { Component, signal } from '@angular/core';

interface Character {
  id: number;
  name: string;
  power: number;
}

@Component({
  selector: 'app-dragonball-page',
  imports: [],
  templateUrl: './dragonball-page.component.html'
})
export class DragonballPageComponent {

  characters = signal<Character[]>([
    {id: 1, name: 'Goku', power: 10000},
    {id: 2, name: 'Vegeta', power: 9000},
    {id: 3, name: 'Piccolo', power: 8000},
    {id: 4, name: 'Gohan', power: 7000},
    {id: 5, name: 'Gong', power: 6000},
    {id: 6, name: 'Vegeta', power: 5000},
    {id: 7, name: 'Piccolo', power: 4000},
    {id: 8, name: 'Gohan', power: 3000},
    {id: 9, name: 'Gong', power: 2000},
    {id: 10, name: 'Vegeta', power: 1000},
  ])

}
