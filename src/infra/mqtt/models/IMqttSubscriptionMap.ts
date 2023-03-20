import { ISubscriptionMap } from "mqtt";

import { OnMQTTMessageCallback } from "./OnMQTTMessageCallback";

interface IMqttSubscriptionMap {
  [topic: string]: {
    cb: OnMQTTMessageCallback;
  } & ISubscriptionMap[typeof topic];
}

export { IMqttSubscriptionMap };
