import { container } from "@infra/containers";

import { NotificationClient } from "./NotificationClient";

const notificationClient = container.resolve(NotificationClient);

export { notificationClient };
