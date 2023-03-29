import { ISubscriptionMap } from "mqtt";

import { MQTTErrorHandler } from "./MQTTErrorHandler";
import { OnMQTTMessageCallback } from "./OnMQTTMessageCallback";

interface IMqttSubscriptionMap {
  [topic: string]: {
    cb: OnMQTTMessageCallback;
    errorHandler: MQTTErrorHandler;
  } & ISubscriptionMap[typeof topic];
}

export { IMqttSubscriptionMap };
