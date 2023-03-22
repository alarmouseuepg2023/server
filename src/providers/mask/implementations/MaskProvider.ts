import { IMaskProvider } from "../models/IMaskProvider";

class MaskProvider implements IMaskProvider {
  removeMacAddress = (macAddress: string): string =>
    macAddress.replace(/:/g, "");

  macAddress = (macAddress: string): string =>
    macAddress.replace(
      /(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})/,
      "$1:$2:$3:$4:$5:$6"
    );

  timestamp = (date: Date): string =>
    date
      .toISOString()
      .replace(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*$/,
        "$1/$2/$3 às $4:$5"
      );
}

export { MaskProvider };
