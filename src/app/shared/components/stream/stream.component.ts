import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenViduVideoComponent } from './ov-video.component';

@Component({
    selector: 'stream-component',
    templateUrl: './stream.component.html',
    styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit {
    @Input()
    user: UserModel;

    @ViewChild('videoComponent', {static: false}) videoComponent: OpenViduVideoComponent;

    mutedSound: boolean;

    constructor() {}

    ngOnInit() {
        console.log('user', this.user);
    }
}
