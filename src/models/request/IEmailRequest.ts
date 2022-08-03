export default interface IEmailRequest{
    toList?: Array<string>;
    bccList?: Array<string>;
    ccList?: Array<string>;
    from?: string;
    subject?: string;
    html?: string;
    text?: string;
}