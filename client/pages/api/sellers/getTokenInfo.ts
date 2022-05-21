import { NextApiRequest, NextApiResponse } from "next";
import { getTokenDetails } from "../../../lib/ethers";

// /api/getTokenInfo?tokenContractAddr=XXXXXXXXXXXXX
export async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("tokenContractAddr" in query)) {
        res.statusCode = 400;
        res.statusMessage = "Query must contain `tokenContractAddr`!";
        res.end();
        return;
    }

    try {
        const tokenDetails = await getTokenDetails(query.tokenContractAddr as string);
        res.statusCode = 200;
        res.send(tokenDetails);
    } catch (e: any) {
        res.statusCode = e?.message === "Seller already exists with same info!" ? 200 : 500;
        res.statusMessage = e?.message || "Request could not be processed!";
    } finally {
        res.end();
    }
}