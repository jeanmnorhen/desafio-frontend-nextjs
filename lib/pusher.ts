import type Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

const channelRefCount: Record<string, number> = {};
const sharedChannels: Record<string, any> = {};
let reconnectCallbacks: Array<() => void> = [];
let wasConnected = false;

export async function getPusherClient(): Promise<Pusher | null> {
  if (typeof window === "undefined") return null;
  if (pusherClient) return pusherClient;

  try {
    const { default: PusherClass } = await import("pusher-js");
    
    if (process.env.NODE_ENV === "development") {
      PusherClass.logToConsole = true;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

    if (pusherKey) {
      pusherClient = new PusherClass(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
      });

      pusherClient.connection.bind("connected", () => {
        if (wasConnected) {
          reconnectCallbacks.forEach(cb => cb());
        }
        wasConnected = true;
      });
    }
  } catch (err) {
    console.error("Falha ao inicializar o Pusher:", err);
  }

  return pusherClient;
}

export async function subscribeToChannel(channelName: string) {
  const client = await getPusherClient();
  if (!client) return null;

  channelRefCount[channelName] = (channelRefCount[channelName] || 0) + 1;

  if (!sharedChannels[channelName]) {
    sharedChannels[channelName] = client.subscribe(channelName);
  }

  return sharedChannels[channelName];
}

export function unsubscribeFromChannel(channelName: string) {
  channelRefCount[channelName] = Math.max(0, (channelRefCount[channelName] || 0) - 1);

  if (channelRefCount[channelName] === 0 && sharedChannels[channelName] && pusherClient) {
    pusherClient.unsubscribe(channelName);
    delete sharedChannels[channelName];
  }
}

export function onReconnect(cb: () => void) {
  reconnectCallbacks.push(cb);
  return () => {
    reconnectCallbacks = reconnectCallbacks.filter(c => c !== cb);
  };
}
