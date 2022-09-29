export interface IDataRequest {
    headers: headers;
    sourceIp?: string;
}

interface headers {
    token: token;
    acceptLanguage: string;
}

interface token{
    userData: userData;
}

interface userData {
    username: string;
    id: string;
}