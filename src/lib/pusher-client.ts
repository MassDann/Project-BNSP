import PusherClient from "pusher-js";

// Make sure to only initialize this once per client
export const getPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: "ap1",
  });
};
