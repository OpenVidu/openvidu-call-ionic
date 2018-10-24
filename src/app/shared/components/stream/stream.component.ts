import { Component, OnInit, Input } from '@angular/core';
import { UserModel } from '../../models/user-model';

@Component({
    selector: 'stream-component',
    templateUrl: './stream.component.html',
    styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit {
    @Input()
    user: UserModel;

    mutedSound: boolean;

    constructor() {}

    ngOnInit() {
        console.log("user", this.user);
    }
}
