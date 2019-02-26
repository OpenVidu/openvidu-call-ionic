import { Component, OnInit, OnDestroy, Input, HostListener, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Platform, ModalController, AlertController } from '@ionic/angular';

import { Router, ActivatedRoute, Params } from '@angular/router';

import { UserModel } from '../shared/models/user-model';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { OpenVidu, Session, Stream, StreamEvent, Publisher, SignalOptions, StreamManagerEvent } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/openvidu.service';

import { trigger, keyframes, state, style, transition, animate } from '@angular/animations';
import { ChatComponent } from '../shared/components/chat/chat.component';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { StreamComponent } from '../shared/components/stream/stream.component';

declare var cordova;

@Component({
    selector: 'app-video-room',
    templateUrl: './video-room.page.html',
    styleUrls: ['./video-room.page.scss'],
    animations: [
        trigger('slideLeftRight', [
            state(
                'in',
                style({
                    transform: 'translateX(0px)',
                    // display: 'block !important'
                }),
            ),
            state(
                'out',
                style({
                    transform: 'translateX(100px)',
                    //display: 'none',
                }),
            ),
            transition('in => out', animate('200ms', keyframes([style({ transform: 'translateX(100px)', display: 'none' })]))),
            transition('out => in', animate('200ms', keyframes([style({ transform: 'translateX(0px)'})]))),
        ]),
        trigger('slideLeftRightChat', [
            state(
                'in',
                style({
                    transform: 'translateX(0px)',
                }),
            ),
            state(
                'out',
                style({
                    transform: 'translateX(100px)',
                    //display: 'none',
                }),
            ),
            transition('in => out', animate('200ms', keyframes([style({ transform: 'translateX(100px)', display: 'none' })]))),
            transition('out => in', animate('200ms', keyframes([style({ transform: 'translateX(0px)' })]))),
        ]),
        trigger('slideTopBottom', [
            state(
                'in',
                style({
                    transform: 'translateY(0px)',
                    //display: 'block !important'
                }),
            ),
            state(
                'out',
                style({
                    transform: 'translateY(100px)',
                    //display: 'none',
                }),
            ),
            transition('in => out', animate('200ms', keyframes([style({ transform: 'translateY(100px)', display: 'none' })]))),
            transition('out => in', animate('200ms', keyframes([style({ transform: 'translateY(0px)'})]))),
        ]),
    ],
})
export class VideoRoomPage implements OnInit, OnDestroy {
    // Constants
    ANDROID_PERMISSIONS = [
        this.androidPermissions.PERMISSION.CAMERA,
        this.androidPermissions.PERMISSION.RECORD_AUDIO,
        this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
    ];
    BIG_ELEMENT_CLASS = 'OV_big';

    buttonsVisibility = 'in';
    chatNotification = 'in';
    cameraBtnColor = 'light';
    camBtnColor = 'light';
    camBtnIcon = 'videocam';
    micBtnColor = 'light';
    micBtnIcon = 'mic';
    chatBtnColor = 'light';
    bigElement: HTMLElement;
    messageReceived = false;
    isBackCamera = false;
    messageList: { connectionId: string; message: string; userAvatar: string }[] = [];
    modalIsPresented = false;

    OV: OpenVidu;
    @ViewChild('mainStream') mainStream: ElementRef;
    session: Session;
    openviduLayout: OpenViduLayout;
    openviduLayoutOptions: OpenViduLayoutOptions;
    mySessionId: string;
    myUserName: string;
    localUser: UserModel;
    remoteUsers: UserModel[];
    resizeTimeout;

    //@ViewChild('streamComponentRemote') streamComponentRemote: StreamComponent;
    @ViewChildren('streamComponentRemotes') streamComponentRemotes: QueryList<StreamComponent>;
    @ViewChild('streamComponentLocal') streamComponentLocal: StreamComponent;

    constructor(
        private platform: Platform,
        private router: Router,
        private route: ActivatedRoute,
        private openViduSrv: OpenViduService,
        public modalController: ModalController,
        private androidPermissions: AndroidPermissions,
        public alertController: AlertController,
    ) {}

    @HostListener('window:beforeunload')
    beforeunloadHandler() {
        this.exitSession();
    }

    @HostListener('window:resize', ['$event'])
    sizeChange(event) {
        clearTimeout(this.resizeTimeout);
        this.updateLayout();
    }

    ngOnInit() {
        this.localUser = new UserModel();
        this.localUser.setType('local');
        this.remoteUsers = [];
        this.generateParticipantInfo();
        this.joinToSession();
        this.openviduLayout = new OpenViduLayout();
        this.openviduLayoutOptions = {
            maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
            minRatio: 9 / 16, // The widest ratio that will be used (default 16x9)
            fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false)*/,
            bigClass: 'OV_big', // The class to add to elements that should be sized bigger
            bigPercentage: 0.82, // The maximum percentage of space the big ones should take up
            bigFixedRatio: false, // fixedRatio for the big ones
            bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
            bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
            bigFirst: false, // Whether to place the big one in the top left (true) or bottom right
            animate: true, // Whether you want to animate the transitions
        };
        this.openviduLayout.initLayoutContainer(document.getElementById('layout'), this.openviduLayoutOptions);
    }

    ngOnDestroy() {
        this.exitSession();
    }

    joinToSession() {
        this.OV = new OpenVidu();
        this.session = this.OV.initSession();
        this.subscribeToUserChanged();
        this.subscribeToStreamCreated();
        this.subscribedToStreamDestroyed();
        this.subscribedToChat();
        this.connectToSession();
    }

    exitSession() {
        if (this.session) {
            this.session.disconnect();
        }
        this.remoteUsers = [];
        this.session = null;
        this.localUser = null;
        this.OV = null;
        this.openviduLayout = null;
        this.router.navigate(['']);
    }

    resetVideoSize() {
        const element = document.querySelector('.' + this.BIG_ELEMENT_CLASS);
        if (element) {
            element.classList.remove(this.BIG_ELEMENT_CLASS);
            this.bigElement = undefined;
            this.updateLayout();
        }
    }

    micStatusChanged(): void {
        (<Publisher>this.localUser.getStreamManager()).publishAudio(!this.localUser.getStreamManager().stream.audioActive);
        if (this.localUser.getStreamManager().stream.audioActive) {
            this.micBtnIcon = 'mic';
            this.micBtnColor = 'light';
        } else {
            this.micBtnIcon = 'mic-off';
            this.micBtnColor = 'primary';
        }
    }

    camStatusChanged(): void {
        (<Publisher>this.localUser.getStreamManager()).publishVideo(!this.localUser.getStreamManager().stream.videoActive);
        if (this.localUser.getStreamManager().stream.videoActive) {
            this.camBtnIcon = 'videocam';
            this.camBtnColor = 'light';
        } else {
            this.camBtnIcon = 'eye-off';
            this.camBtnColor = 'primary';
        }
    }

    toggleCamera() {
        this.OV.getDevices().then((devices: Array<any>) => {
            console.warn("DEVICES ", devices);
            console.log(devices);
            console.log(devices.filter((device) => device.kind === 'videoinput'));
            const videoArray = devices.filter((device) => device.kind === 'videoinput');
            const rtcDevices  = cordova.plugins.iosrtc.enumerateDevices();
            console.log("RTC:", rtcDevices);
            if (videoArray && videoArray.length > 0) {
                const lastDeviceId = videoArray[videoArray.length - 1].deviceId;
                const firstDeviceId = videoArray[0].deviceId;
                let videSource: string;
                if (lastDeviceId === this.localUser.getActualDeviceId()) {
                    videSource = firstDeviceId;
                } else {
                    videSource = lastDeviceId;
                }
                const publisher = this.OV.initPublisher(undefined, {
                    videoSource: videSource,
                    publishAudio: this.localUser.getStreamManager().stream.audioActive,
                    publishVideo: this.localUser.getStreamManager().stream.videoActive,
                });
                cordova.plugins.iosrtc.freeCamera();
                this.localUser.setActualDeviceId(videSource);
                this.session.unpublish(<Publisher>this.localUser.getStreamManager());
                
                this.session.publish(publisher);
                this.localUser.setStreamManager(publisher);
                this.isBackCamera = !this.isBackCamera;
                cordova.plugins.iosrtc.refreshVideos();

                /*const newUser = new UserModel();
                newUser.setStreamManager(publisher);
                const nickname = 'NUEVO USER';
                newUser.setNickname(nickname);
                newUser.setType('remote');
                this.remoteUsers.push(newUser);*/

                this.cameraBtnColor = this.cameraBtnColor === 'light' ? 'primary' : 'light';
        }
        });
    }

    async toggleChat() {
        this.buttonsVisibility = 'out';
        this.chatNotification = 'out';
        const modal = await this.modalController.create({
            component: ChatComponent,
            componentProps: { user: this.localUser, messageList: this.messageList },
        });

        modal.onWillDismiss().then(() => {
            this.modalIsPresented = false;
            this.toggleButtons();
            this.updateLayout();
        });

        return await modal.present().then(() => {
            this.modalIsPresented = true;
            this.chatBtnColor = 'light';
            this.messageReceived = false;
        });
    }

    public toggleButtons() {
        this.buttonsVisibility = this.buttonsVisibility === 'in' ? 'out' : 'in';
        this.chatNotification = this.buttonsVisibility;
    }

    public toggleButtonsOrEnlargeStream(event) {
        event.preventDefault();
        event.stopPropagation(); 
        const path = event.path || event.composedPath()
        const element: HTMLElement = path.filter((e: HTMLElement) => e.className && e.className.includes('OT_root'))[0];
        if (this.bigElement && element === this.bigElement) {
            this.toggleButtons();
        } else if (this.bigElement !== element) {
            if (this.bigElement) {
                this.bigElement.classList.remove(this.BIG_ELEMENT_CLASS);
            } else {
                this.toggleButtons();
            }
            element.classList.add(this.BIG_ELEMENT_CLASS);
            this.bigElement = element;
        }
        this.updateLayout();
    }

    private generateParticipantInfo() {
        this.route.params.subscribe((params: Params) => {
            this.mySessionId = params.roomName;
            this.myUserName = 'OpenVidu_User' + Math.floor(Math.random() * 100000);
        });
    }

    private deleteRemoteStream(stream: Stream): void {
        const userStream = this.remoteUsers.filter((user: UserModel) => user.getStreamManager().stream === stream)[0];
        const index = this.remoteUsers.indexOf(userStream, 0);
        if (index > -1) {
            this.remoteUsers.splice(index, 1);
        }
    }


    private subscribeToUserChanged() {
        this.session.on('signal:userChanged', (event: any) => {
          const data = JSON.parse(event.data);
          this.remoteUsers.forEach((user: UserModel) => {
            if (user.getConnectionId() === event.from.connectionId) {
              if (data.avatar !== undefined) {
                user.setUserAvatar(data.avatar);
              }
            }
          });
        });
      }

    private subscribeToStreamCreated() {
        this.session.on('streamCreated', (event: StreamEvent) => {
            const subscriber = this.session.subscribe(event.stream, undefined);
            subscriber.on('streamPlaying', (e: StreamManagerEvent) => {
                this.updateLayout();
                (<HTMLElement>subscriber.videos[0].video).parentElement.classList.remove('custom-class');
            });
            const newUser = new UserModel();
            newUser.setStreamManager(subscriber);
            newUser.setConnectionId(event.stream.connection.connectionId);
            const nickname = event.stream.connection.data.split('%')[0];
            try {
                newUser.setNickname(JSON.parse(nickname).clientData);
            } catch (err) {
                newUser.setNickname(nickname);
            }
            newUser.setType('remote');
            this.openViduSrv.getRandomAvatar().then((avatar) => {
                newUser.setUserAvatar(avatar);
                this.remoteUsers.push(newUser);
                this.sendSignalUserAvatar(this.localUser);
            });
            this.buttonsVisibility = 'out';
            this.chatNotification = 'out';
        });
    }

    private subscribedToStreamDestroyed() {
        this.session.on('streamDestroyed', (event: StreamEvent) => {
            this.deleteRemoteStream(event.stream);
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateLayout();
            }, 20);
            event.preventDefault();
        });
    }

    private subscribedToChat() {
        this.session.on('signal:chat', (event: any) => {
            const data = JSON.parse(event.data);
            const messageOwner =
                this.localUser.getConnectionId() === data.connectionId
                    ? this.localUser
                    : this.remoteUsers.filter((user) => user.getConnectionId() === data.connectionId)[0];

            this.messageList.push({
                connectionId: data.connectionId,
                message: data.message,
                userAvatar: messageOwner.getAvatar(),
            });
            ChatComponent.prototype.scrollToBottom();

            if (!this.modalIsPresented) {
                this.chatBtnColor = 'secondary';
                this.messageReceived = true;
                this.chatNotification = 'in';
            }
        });
    }

    private sendSignalUserAvatar(user: UserModel): void {
        const data = {
          avatar: user.getAvatar(),
        };
        const signalOptions: SignalOptions = {
          data: JSON.stringify(data),
          type: 'userChanged',
        };
        this.session.signal(signalOptions);
      }

    private connectToSession(): void {
        this.openViduSrv
            .getToken(this.mySessionId)
            .then((token) => {
                this.connect(token);
            })
            .catch((error) => {
                console.error('There was an error getting the token:', error.code, error.message);
                this.openAlertError(error.message);
            });
    }

    private connect(token: string): void {
        this.session
            .connect(
                token,
                { clientData: this.myUserName },
            )
            .then(() => {
                if (this.platform.is('cordova')) {
                    if(this.platform.is('android')){
                        console.log("Android platform");
                        this.checkAndroidPermissions()
                        .then(() => {
                            this.connectWebCam();
                        })
                        .catch((err) => console.error(err));

                    } else if (this.platform.is('ios')) {
                        console.log("iOS platform");
                        this.connectWebCam();
                    }
                } else {
                    this.connectWebCam();
                }
            })
            .catch((error) => {
                console.error('There was an error connecting to the session:', error.code, error.message);
                this.openAlertError(error.message);
            });
    }

    private checkAndroidPermissions(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.platform.ready().then(() => {
                this.androidPermissions
                    .requestPermissions(this.ANDROID_PERMISSIONS)
                    .then(() => {
                        this.androidPermissions
                            .checkPermission(this.androidPermissions.PERMISSION.CAMERA)
                            .then((camera) => {
                                this.androidPermissions
                                    .checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
                                    .then((audio) => {
                                        this.androidPermissions
                                            .checkPermission(this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS)
                                            .then((modifyAudio) => {
                                                if (camera.hasPermission && audio.hasPermission && modifyAudio.hasPermission) {
                                                    resolve();
                                                } else {
                                                    reject(
                                                        new Error(
                                                            'Permissions denied: ' +
                                                                '\n' +
                                                                ' CAMERA = ' +
                                                                camera.hasPermission +
                                                                '\n' +
                                                                ' AUDIO = ' +
                                                                audio.hasPermission +
                                                                '\n' +
                                                                ' AUDIO_SETTINGS = ' +
                                                                modifyAudio.hasPermission,
                                                        ),
                                                    );
                                                }
                                            })
                                            .catch((err) => {
                                                console.error(
                                                    'Checking permission ' +
                                                        this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS +
                                                        ' failed',
                                                );
                                                reject(err);
                                            });
                                    })
                                    .catch((err) => {
                                        console.error(
                                            'Checking permission ' + this.androidPermissions.PERMISSION.RECORD_AUDIO + ' failed',
                                        );
                                        reject(err);
                                    });
                            })
                            .catch((err) => {
                                console.error('Checking permission ' + this.androidPermissions.PERMISSION.CAMERA + ' failed');
                                reject(err);
                            });
                    })
                    .catch((err) => console.error('Error requesting permissions: ', err));
            });
        });
    }

    private connectWebCam(): void {
        const publisher: Publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: true,
            publishVideo: true,
            resolution: '640x480',
            frameRate: 30,
            insertMode: 'APPEND',
        });
        this.localUser.setNickname(this.myUserName);
        this.localUser.setConnectionId(this.session.connection.connectionId);

        if (this.session.capabilities.publish) {
            this.session.publish(publisher).then(() => {
                this.localUser.setStreamManager(publisher);
                this.localUser.getStreamManager().on('streamPlaying', () => {
                    this.updateLayout();
                    (<HTMLElement>this.localUser.getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
                });
                this.openViduSrv.getRandomAvatar().then((avatar) => {
                    this.localUser.setUserAvatar(avatar);
                    this.sendSignalUserAvatar(this.localUser);
                });
            }).catch((err) => console.error(err));
        }
    }

    private updateLayout() {
        this.resizeTimeout = setTimeout(() => {
            this.openviduLayout.updateLayout();
            setTimeout(() => {
                console.warn("STREAM Component local", this.streamComponentLocal);
                console.warn("STREAM Component Remote", this.streamComponentRemotes);
                if (this.streamComponentLocal) {
                    this.streamComponentLocal.videoComponent.applyIosIonicVideoAttributes();
                }
                if (this.streamComponentRemotes.length > 0) {
                    this.streamComponentRemotes.forEach((stream: StreamComponent) => {
                        stream.videoComponent.applyIosIonicVideoAttributes()
                    });
                }
            }, 250);
        }, 20);
    }

    private async openAlertError(message: string) {
        const alert = await this.alertController.create({
            header: 'Error occurred!',
            subHeader: 'There was an error connecting to the session:',
            message: message,
            buttons: ['OK'],
        });
        await alert.present();
    }
}
