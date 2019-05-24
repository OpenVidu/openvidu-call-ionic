import { StreamManager } from 'openvidu-browser';

export class UserModel {
    private connectionId: string;
    private nickname: string;
    private streamManager: StreamManager;
    private type: 'local' | 'remote';
    private actualDeviceId: string;
    private avatar: string;

    constructor() {
        this.connectionId = '';
        this.nickname = '';
        this.streamManager = null;
        this.type = 'local';
        this.actualDeviceId = '';
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
        return this.avatar;
    }

    /* Setters */

    public setStreamManager(streamManager: StreamManager) {
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

    public setUserAvatar(avatar: string): void {
        this.avatar = avatar;
    }
}
