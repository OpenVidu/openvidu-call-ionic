import { StreamManager } from 'openvidu-browser';

export class UserModel {
    private connectionId: string;
    private nickname: string;
    private streamManager: StreamManager;
    private type: 'local' | 'remote';
    private actualDeviceId: string;
    private avatar: string;
    private audioActive: boolean;
    private videoActive: boolean;
    private audioSource: string;
    private videoSource: string;

    constructor() {
        this.connectionId = '';
        this.nickname = '';
        this.streamManager = null;
        this.type = 'local';
        this.actualDeviceId = '';
        this.audioActive = true;
        this.videoActive = true;
        this.audioSource = undefined;
        this.videoSource = undefined;
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

    public isAudioActive(): boolean {
        return this.audioActive;
    }

    public isVideoActive(): boolean {
        return this.videoActive;
    }

    public getAudioSource(): string {
        return this.audioSource;
    }

    public getVideoSource(): string {
        return this.videoSource;
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

    public setAudioActive(isAudioActive: boolean) {
        this.audioActive = isAudioActive;
    }

    public setVideoActive(isVideoActive: boolean) {
        this.videoActive = isVideoActive;
    }

    public setAudioSource(audioSource: string) {
        this.audioSource = audioSource;
    }

    public setVideoSource(videoSource: string) {
        this.videoSource = videoSource;
    }
}
