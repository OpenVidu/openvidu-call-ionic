import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { OpenVidu, Publisher } from 'openvidu-browser';
import { UserModel } from '../../models/user-model';

declare var cordova;

@Component({
    selector: 'app-setting-up-modal',
    templateUrl: './setting-up-modal.component.html',
    styleUrls: ['./setting-up-modal.component.scss'],
})
export class SettingUpModalComponent implements OnInit {
    OV: OpenVidu;
    localUser: UserModel;
    audioDevices: any[] = [];
    videoDevices: any[] = [];

    constructor(public modalController: ModalController, public platform: Platform) {}

    ngOnInit() {
        this.OV = new OpenVidu();
        this.localUser = new UserModel();
        this.initAudioDevices();
        this.initVideoDevices();
        this.initPublisher();
    }

    getDevices() {
        return new Promise((resolve) => {
            this.OV.getDevices().then((devices) => {
                resolve(devices);
            });
        });
    }

    initAudioDevices() {
        this.getDevices().then((devices: any) => {
            this.audioDevices = devices.filter((device) => device.kind === 'audioinput');
            console.log('Audio devices: ', this.audioDevices);
        });
    }

    initVideoDevices() {
        this.getDevices().then((devices: any) => {
            this.videoDevices = devices.filter((device) => device.kind === 'videoinput');
            console.log('Video devices: ', this.videoDevices);
        });
    }

    dismiss() {
        this.modalController.dismiss();
        this.destroyPublisher();
        this.localUser = null;
    }

    setAudioDevice(event) {
        console.log('Setting audio device to: ', event.detail.value);
        const audioSource = event.detail.value === 'None' ? undefined : event.detail.value;
        this.localUser.setAudioActive(!!audioSource);
        this.localUser.setAudioSource(audioSource);
        if (!!audioSource) {
          this.destroyPublisher();
          this.initPublisher();
        } else {
          this.micOff();
        }
    }

    setVideoDevice(event) {
        console.log('Setting video device to: ', event.detail.value);
        const videoSource = event.detail.value === 'None' ? undefined : event.detail.value;
        this.localUser.setVideoActive(!!videoSource);
        this.localUser.setVideoSource(videoSource);
        if (!!videoSource) {
            this.destroyPublisher();
            this.initPublisher();
        } else {
            this.camOff();
        }
    }

    camOff() {
        (<Publisher>this.localUser.getStreamManager()).publishVideo(!!this.localUser.getVideoSource());
    }

    micOff() {
        (<Publisher>this.localUser.getStreamManager()).publishAudio(!!this.localUser.getAudioSource());
    }

    refreshVideos() {
        if (this.platform.is('ios') && this.platform.is('cordova')) {
            cordova.plugins.iosrtc.refreshVideos();
        }
    }

    join() {
        this.modalController.dismiss(this.localUser);
    }

    private initPublisher(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('initialize publisher');
            console.log('audioDevice', this.localUser.getAudioSource());
            console.log('videoDevice', this.localUser.getVideoSource());
            console.log('aduio Active ', this.localUser.isAudioActive());
            console.log('video active', this.localUser.isVideoActive());
            this.OV.initPublisherAsync(undefined, {
                audioSource: this.localUser.getAudioSource(),
                videoSource: this.localUser.getVideoSource(),
                publishAudio: this.localUser.isAudioActive(),
                publishVideo: this.localUser.isVideoActive(),
                // mirror: this.camValue && this.camValue.type === 'FRONT'
            })
                .then((publisher: Publisher) => {
                    // this.subscribeToVolumeChange(publisher);
                    this.localUser.setStreamManager(publisher);
                    resolve(publisher);
                })
                .catch((error) => reject(error));
        });
    }

    private destroyPublisher() {
        console.log("Destroying publisher...");
        //(<Publisher>this.localUser.getStreamManager()).off('streamAudioVolumeChange');
        this.localUser.getStreamManager().stream.disposeWebRtcPeer();
        this.localUser.getStreamManager().stream.disposeMediaStream();
        this.localUser.setStreamManager(null);
    }
}
