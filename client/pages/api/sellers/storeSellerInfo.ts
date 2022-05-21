import { NextApiRequest, NextApiResponse } from "next";
import { storeSellerInfo } from "../../../lib/ethers";


// /api/storeSellerInfo?name=AAAA&email=aa@email.com&id=ABCD
export async function handler(req: NextApiRequest, res: NextApiResponse) {

    const query = req.query;
    if (!("name" in query && "email" in query && "id" in query)) {
        res.statusCode = 400;
        res.statusMessage = "Query must contain `id`, `email` and `name`!";
        res.end();
        return;
    }

    try {
        await storeSellerInfo(query.id as string, query.email as string, query.name as string);
        res.statusCode = 200;
        res.statusMessage = "Seller details stored/updated";
    } catch (e: any) {
        res.statusCode = e?.message === "Seller already exists with same info!" ? 200 : 500;
        res.statusMessage = e?.message || "Request could not be processed!";
    } finally {
        res.end();
    }
}