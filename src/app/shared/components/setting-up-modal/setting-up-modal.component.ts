import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
        this.initDevices();
        this.initPublisher();
    }

    initDevices() {
        this.OV.getDevices().then((devices: any) => {
            this.audioDevices = devices.filter((device) => device.kind === 'audioinput');
            this.videoDevices = devices.filter((device) => device.kind === 'videoinput');
            console.log('Audio devices: ', this.audioDevices);
            console.log('Video devices: ', this.videoDevices);
            if (this.platform.is('cordova')) {
                this.localUser.setVideoSource(this.videoDevices.filter((device: any) => device.label.includes('Front'))[0].deviceId);
            }
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
        (<Publisher>this.localUser.getStreamManager()).publishVideo(false);

    }

    micOff() {
        (<Publisher>this.localUser.getStreamManager()).publishAudio(false);
    }

    refreshVideos() {
        if (this.platform.is('ios') && this.platform.is('cordova')) {
            cordova.plugins.iosrtc.refreshVideos();
        }
    }

    join() {
        this.modalController.dismiss({user: this.localUser, videoDevices: this.videoDevices});
    }

    private initPublisher(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('initialize publisher');
            const device = this.videoDevices.filter((video) =>
                video.deviceId === this.localUser.getVideoSource()
            );
            const isBackCamera = !!device[0] && device[0].label.includes('Back');
            this.localUser.setIsBackCamera(isBackCamera);

            this.OV.initPublisherAsync(undefined, {
                audioSource: this.localUser.getAudioSource(),
                videoSource: this.localUser.getVideoSource(),
                publishAudio: this.localUser.isAudioActive(),
                publishVideo: this.localUser.isVideoActive(),
                mirror: !this.localUser.isBackCamera()
            })
                .then((publisher: Publisher) => {
                    this.localUser.setStreamManager(publisher);
                    resolve(publisher);
                })
                .catch((error) => reject(error));
        });
    }

    private destroyPublisher() {
        console.log('Destroying publisher...');
        this.localUser.getStreamManager().stream.disposeWebRtcPeer();
        this.localUser.getStreamManager().stream.disposeMediaStream();
        this.localUser.setStreamManager(null);
    }
}
