import { NextApiRequest, NextApiResponse } from "next";
import { createOrder } from "../../../lib/paypal";

export default async function CreateOrderRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const amount: string = req.body.price as string;
    const order = await createOrder(amount);
    res.status(200).json(order);
  } else {
    res.status(501).send("only post method allowed");
  }
}
