import { DeviceStatusDomain } from "./DeviceStatusDomain";
import { InviteStatusDomain } from "./InviteStatusDomain";
import { OperationsWithEmailConfirmationDomain } from "./OperationsWithEmailConfirmationDomain";

enum Domains {
  DEVICE_STATUS = "DeviceStatus",
  INVITE_STATUS = "InviteStatus",
  OPERATIONS_WITH_EMAIL_CONFIRMATION = "OperationsWithEmailConfirmation",
}

export {
  Domains,
  OperationsWithEmailConfirmationDomain,
  DeviceStatusDomain,
  InviteStatusDomain,
};
