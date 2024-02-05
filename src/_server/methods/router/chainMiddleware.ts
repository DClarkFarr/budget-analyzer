import { NextRequest, NextResponse } from "next/server";

export type MiddlewareCallback<A extends NextRequest = NextRequest> = <
    B extends object
>(
    req: A,
    res: B,
    next: (data?: any) => void
) => void;

export type FinalCallback<A extends NextRequest = NextRequest> = (
    req: A,
    res: any
) => Promise<NextResponse>;

type ConvertHandlerArray<HS extends Array<MiddlewareCallback<any>>> = {
    [K in keyof HS]: HS[K] extends MiddlewareCallback<infer A> ? A : never;
};

export default function chainMiddleware<
    FS extends Array<MiddlewareCallback<any>>,
    FCR extends ConvertHandlerArray<FS>[number]
>(callbacks: FS, finalCallback: FinalCallback<FCR>) {
    let responseData: any;

    const cycleCallback = async <A extends NextRequest, B extends object>(
        creq: A,
        cres: B,
        handler: MiddlewareCallback<A>
    ) => {
        await new Promise((resolve) => {
            const next = (data?: any) => {
                if (responseData !== undefined) {
                    responseData = data;
                }
                resolve(1);
            };

            handler(creq, cres, next);
        });

        return [creq, cres] as const;
    };

    return async (req: NextRequest, res: NextResponse) => {
        let activeReq = req,
            activeRes = res;

        if (callbacks.length) {
            for (let callback of callbacks) {
                if (responseData !== undefined) {
                    break;
                }
                [activeReq, activeRes] = await cycleCallback(
                    activeReq,
                    activeRes,
                    callback
                );
            }
        }

        if (responseData !== undefined) {
            if (responseData instanceof Error) {
                return NextResponse.json(
                    { message: responseData.message },
                    { status: 410 }
                );
            }
            return NextResponse.json(responseData, { status: 410 });
        }

        return finalCallback(activeReq as FCR, activeRes);
    };
}

/*
const testChain1 = [
    ((req, res, next) => {
        next();
    }) as Handler<NextRequest & { session: Record<string, string> }>,
    ((req, res, next) => {
        req.extra = { hello: 1 };

        next();
    }) as Handler<NextRequest & { extra: { hello: number } }>,
    ((req, res, next) => {
        req.extra.goodbye = 2;

        next();
    }) as Handler<NextRequest & { extra: { hello: number; goodbye: number } }>,
];

const chained1 = chainMiddleware(testChain1, (req, res) => {
    console.log("got req", req);

    return NextResponse.json({ message: "ok" });
});

const chained2 = chainMiddleware(
    [
        ((req, res, next) => {
            next();
        }) as Handler<NextRequest & { session: Record<string, string> }>,
        ((req, res, next) => {
            req.extra = { hello: 1 };

            next();
        }) as Handler<NextRequest & { extra: { hello: number } }>,
        ((req, res, next) => {
            req.extra.goodbye = 2;

            next();
        }) as Handler<
            NextRequest & { extra: { hello: number; goodbye: number } }
        >,
    ],
    (req, res) => {
        console.log("got req", req);

        return NextResponse.json({ message: "ok" });
    }
);

type ReturnFuncDef = () => any;
type ReturnTestArray = [() => number, () => string, () => boolean];
type ConvertFunctionReturns<FS extends ReadonlyArray<ReturnFuncDef>> = {
    [K in keyof FS]: FS[K] extends () => any ? ReturnType<FS[K]> : never;
};

type TestChain1 = ConvertHandlerArray<typeof testChain1>;

const returnTestArray1 = [
    () => "hey" as const,
    () => 1 as const,
    () => true as const,
] as const;
const returnTestArray2 = [() => "hey", () => 1, () => true] as const;

// type ArrTransform<T extends Readonly<{ id: number; color: string }[]>> = {
//     [I in keyof T]: T[I] extends { color: infer V } ? V : never;
// };

async function chainFunctionsReturns<FS extends ReadonlyArray<ReturnFuncDef>>(
    callbacks: FS
) {
    const returnTypes: any[] = [];
    for (let i = 0; i < callbacks.length; i++) {
        returnTypes.push(callbacks[i]());
    }

    return returnTypes as ConvertFunctionReturns<FS>;
}

type ReturnTestValues = ConvertFunctionReturns<ReturnTestArray>;
type ReturnValues1 = ConvertFunctionReturns<typeof returnTestArray1>;
type ReturnValues2 = ConvertFunctionReturns<typeof returnTestArray2>;
const returnTestValues1 = chainFunctionsReturns(returnTestArray1);
const returnTestValues2 = chainFunctionsReturns(returnTestArray2);

type ParamFuncDef = (req: any) => void;
type ConvertFunctionParams<FS extends ReadonlyArray<ParamFuncDef>> = {
    [K in keyof FS]: FS[K] extends (req: any) => any
        ? Parameters<FS[K]>[0]
        : never;
};

async function chainFunctionParams<FS extends ReadonlyArray<ParamFuncDef>>(
    callbacks: FS,
    initial: any
) {
    const paramTypes: any[] = [];
    for (let i = 0; i < callbacks.length; i++) {
        const callback = callbacks[i];
        type Param = Parameters<typeof callback>[0];
        paramTypes.push(callbacks[i](initial as Param));
    }

    return paramTypes as ConvertFunctionParams<FS>;
}

type ParamTestArray = [
    (req: number) => void,
    (req: string) => void,
    (req: boolean) => void
];
const paramTest1 = [
    (req: 1) => {},
    (req: "hey") => {},
    (req: true) => {},
] as const;
type ParamTestValues = ConvertFunctionParams<ParamTestArray>;
type ParamTestValues1 = ConvertFunctionParams<typeof paramTest1>;
const paramTestValues1 = chainFunctionParams(paramTest1, 1);
*/
