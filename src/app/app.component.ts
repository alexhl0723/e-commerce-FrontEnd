import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/shared/navbar/navbar.component";
import { NotificationsComponent } from "./components/shared/notifications/notifications.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterOutlet, NotificationsComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'ztitan';
}
