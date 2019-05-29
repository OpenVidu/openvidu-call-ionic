import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { VideoRoomPage } from './video-room.page';
import { StreamComponent } from '../shared/components/stream/stream.component';
import { OpenViduVideoComponent } from '../shared/components/stream/ov-video.component';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { SettingUpModalComponent } from '../shared/components/setting-up-modal/setting-up-modal.component';


const routes: Routes = [
  {
    path: '',
    component: VideoRoomPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [VideoRoomPage, StreamComponent, ChatComponent, SettingUpModalComponent, OpenViduVideoComponent],
  exports: [],
  entryComponents: [ChatComponent, SettingUpModalComponent]
})
export class VideoRoomPageModule {}
