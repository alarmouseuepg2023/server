interface IQRCodeProvider {
  generateQRCodeFile(filePath: string, payload: string): Promise<void>;
}

export { IQRCodeProvider };
