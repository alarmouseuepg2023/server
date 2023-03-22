import { IMaskProvider } from "../models/IMaskProvider";

class MaskProvider implements IMaskProvider {
  removeMacAddress = (macAddress: string): string =>
    macAddress.replace(/:/g, "");

  macAddress = (macAddress: string): string =>
    macAddress.replace(
      /(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})/,
      "$1:$2:$3:$4:$5:$6"
    );
}

export { MaskProvider };
