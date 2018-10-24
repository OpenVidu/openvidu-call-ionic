import { StreamManager } from 'openvidu-browser';

export class UserModel {
    private connectionId: string;
    private nickname: string;
    private streamManager: StreamManager;
    private type: 'local' | 'remote';
    private actualDeviceId: string;
    private avatar: HTMLCanvasElement;

    constructor() {
        this.connectionId = '';
        this.nickname = '';
        this.streamManager = null;
        this.type = 'local';
        this.actualDeviceId = '';
        this.createAvatar();
    }

    /* Getters */

    public getConnectionId(): string {
        return this.connectionId;
    }

    public getNickname(): string {
        return this.nickname;
    }

    public getStreamManager(): StreamManager {
        return this.streamManager;
    }

    public isLocal(): boolean {
        return this.type === 'local';
    }
    public isRemote(): boolean {
        return !this.isLocal();
    }

    public getActualDeviceId(): string {
        return this.actualDeviceId;
    }

    public getAvatar(): string {
        return this.avatar.toDataURL();
    }

    /* Setters */

    public setStreamManager(streamManager: StreamManager) {
        console.log('guardadndo stream manager', streamManager);
        this.streamManager = streamManager;
    }

    public setConnectionId(conecctionId: string) {
        this.connectionId = conecctionId;
    }
    public setNickname(nickname: string) {
        this.nickname = nickname;
    }
    public setType(type: 'local' | 'remote') {
        this.type = type;
    }
    public setActualDeviceId(deviceId: string) {
        this.actualDeviceId = deviceId;
    }

    public setUserAvatar(): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const video = <HTMLVideoElement>document.getElementById('video-' + this.getStreamManager().stream.streamId);
                const avatar = this.avatar.getContext('2d');
                avatar.drawImage(video, 0, 0, 480, 480, 0, 0, 60, 60);
                console.log('Photo was taken: ', this.avatar);
                resolve();
            }, 3000);
        });
    }
    private createAvatar() {
        this.avatar = document.createElement('canvas');
        this.avatar.className = 'user-img';
        this.avatar.width = 60;
        this.avatar.height = 60;
    }
}
