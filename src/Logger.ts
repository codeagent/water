
export class Logger
{
    public log(message?: any, ...optionalParams: any[])
    {
        console.log(message, ...optionalParams);
    }

    public error(message?: any, ...optionalParams: any[])
    {
        console.error(message, ...optionalParams);
    }

    public warn(message?: any, ...optionalParams: any[])
    {
        console.warn(message, ...optionalParams);
    }

    public info(message?: any, ...optionalParams: any[])
    {
        console.info(message, ...optionalParams);
    }
}