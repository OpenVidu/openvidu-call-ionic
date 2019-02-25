import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'chat-component',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
    @Input()
    user: UserModel;

    @Output()
    messageReceived = new EventEmitter<any>();
    @Output()
    closeChat = new EventEmitter<any>();

    message: string;
    @Input()
    messageList: { connectionId: string; message: string; userAvatar: string }[] = [];

    constructor(public modalController: ModalController) {}

    ngOnInit() {}

    eventKeyPress(event) {
        if (event && event.keyCode === 13) {
            this.sendMessage();
        }
    }

    sendMessage(): void {
        if (this.user && this.message) {
            this.message = this.message.replace(/ +(?= )/g, '');
            if (this.message !== '' && this.message !== ' ') {
                const data = {
                    connectionId: this.user.getConnectionId(),
                    message: this.message,
                    nickname: this.user.getNickname(),
                };
                this.user.getStreamManager().stream.session.signal({
                    data: JSON.stringify(data),
                    type: 'chat',
                });
                this.scrollToBottom();
                this.message = '';
            }
        }
    }

    scrollToBottom(): void {
        setTimeout(() => {
            try {
                const contentMessage = document.getElementById('message-wrap');
                contentMessage.scrollTop = contentMessage.scrollHeight;
            } catch (err) {
                console.error(err);
            }
        }, 20);
    }

    dismiss() {
        this.modalController.dismiss();
    }

    onFocus() {}
}
