import { injectable } from "inversify";
import QRCode from "qrcode";

import { IQRCodeProvider } from "../models/IQRCodeProvider";

@injectable()
class QRCodeProvider implements IQRCodeProvider {
  generateQRCodeFile = (filePath: string, payload: string): Promise<void> =>
    QRCode.toFile(filePath, payload, {
      type: "png",
      margin: 1,
      scale: 10,
      width: 400,
      color: { dark: "#2E639B" },
    });
}

export { QRCodeProvider };
