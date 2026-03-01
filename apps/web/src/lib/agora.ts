import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ILocalAudioTrack,
  type IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

export type AgoraJoinParams = {
  appId: string;
  token: string;
  channel: string;
  uid: number;
};

export type AgoraSession = {
  client: IAgoraRTCClient;
  localAudioTrack: ILocalAudioTrack;
};

export function createAgoraClient(): IAgoraRTCClient {
  return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
}

export async function joinAgoraVoice(params: AgoraJoinParams): Promise<AgoraSession> {
  const client = createAgoraClient();
  await client.join(params.appId, params.channel, params.token, params.uid);

  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localAudioTrack]);

  return { client, localAudioTrack };
}

export function wireRemoteAudio(client: IAgoraRTCClient) {
  const onUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      const track: IRemoteAudioTrack | undefined = user.audioTrack;
      track?.play();
    }
  };

  const onUserUnpublished = () => {};

  client.on("user-published", onUserPublished);
  client.on("user-unpublished", onUserUnpublished);

  return () => {
    client.off("user-published", onUserPublished);
    client.off("user-unpublished", onUserUnpublished);
  };
}

export async function leaveAgora(session: AgoraSession) {
  session.localAudioTrack.stop();
  session.localAudioTrack.close();
  await session.client.leave();
}
