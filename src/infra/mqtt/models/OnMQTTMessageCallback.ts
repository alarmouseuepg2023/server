type OnMQTTMessageCallback = (payload: Buffer) => Promise<void>;

export { OnMQTTMessageCallback };
