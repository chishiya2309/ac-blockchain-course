export class SmartContract {
    private message: string;

    constructor(initialMessage: string) {
        // TODO: initialize the message with initialMessage
        this.message = initialMessage;
    }

    public updateMessage(newMsg: string): void {
        // TODO: update the message with newMsg
        this.message = newMsg;
    }

    public getMessage(): string {
        // TODO: return the current message
        return this.message
    }
}