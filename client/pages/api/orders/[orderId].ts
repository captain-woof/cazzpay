import { NextApiRequest, NextApiResponse } from "next";
import { capturePayment } from "../../../lib/paypal";

export default async function CaptureOrderRequest(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const orderId: string = req.query.orderId as string;
      const mintTo = req.body.mintTo;
      const captureData = await capturePayment(orderId, mintTo);
      res.status(200).json(captureData);
    } catch (e) {
      res.status(500).send(e);
    }

  } else {
    res.status(501).send("Only post method is allowed");
  }
}
