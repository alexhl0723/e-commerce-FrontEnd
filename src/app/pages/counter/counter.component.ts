import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  templateUrl: './counter.component.html',
})
export class CounterComponent {

  counter: number = 10;
    counterSignal = signal<number>(10);
    
    incrementar() {
        this.counter += 1;
        this.counterSignal.update(value => value + 1);
    }

    decrementar(){
        this.counter -= 1;
        this.counterSignal.update(value => value - 1);
    }

    reset(){
        this.counter = 10;
        this.counterSignal.set(10);
    }

}
