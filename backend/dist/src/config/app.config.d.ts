export declare const config: {
    app: {
        name: string;
        version: string;
        env: string;
        port: string | number;
    };
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        origin: string[];
        credentials: boolean;
    };
};
