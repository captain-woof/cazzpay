const CLIENT_ID: string = process.env.PAYPAL_CLIENT_ID as string;
const CLIENT_SECRET: string = process.env.PAYPAL_CLIENT_SECRET as string;
const base = "https://api-m.sandbox.paypal.com";

/** CreateOrder,CaptureOrder & RefundOrder for payment  */
//library function for creating an order
export async function createOrder(amountPrice: string): Promise<string> {
  const accessToken: string = await generateAccessToken();
  const url: string = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amountPrice,
          },
        },
      ],
    }),
  });

  const data = await response.json();
  return data;
}
//library function to capture the payment of the order based on orderId
export async function capturePayment(orderId: string) {
  try {
    const access_token: string = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = await response.json();
    console.log(data);
    const captureDetails = data.purchase_units[0].payments.captures[0];
    //this amount is for creating respected amount of CZP Token
    const { amount } = captureDetails.amount;
    //this captureId is for refunding the payment
    const captureId = captureDetails.id;
    console.log(captureId);
    return data;
    /**
     * Now here ethereum transaction will happen
     * try{
     *  //Etherum transactions
     *
     * }catch()
     *
     */
  } catch (err) {
    return err;
  }
}

//incase of any error happens while minting the token or the token could not generated
//we have to refund the payment
export async function refundPayment(paymentId: string) {
  const access_token: string = await generateAccessToken();
  const url = `${base}/v2/payments/captures/${paymentId}/refund`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });
  const data = await response.json();
  return data;
}

//helper function for generating access token via paypal client id and secret
export async function generateAccessToken(): Promise<string> {
  const auth: string = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
    "base64"
  );
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}
/** Till here is for order payment */

/** Here are the login utilites */

//generating access token for customer via authorization code
export async function generateAccessTokenForCustomer(
  authorization: string
): Promise<PayPalToken> {
  const auth: string = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
    "base64"
  );
  const url = `${base}/v1/oauth2/token`;
  const response = await fetch(url, {
    method: "post",
    body: `grant_type=authorization&code=${authorization}`,
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

//fetching the customer data via access_token
export async function getCustomerData(accessToken: string) {
  const url = `${base}/v1/identity/oauth2/userinfo?schema=paypalv1.1`;
  const response = await fetch(url, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  const customerData: PaypalProfileProps = {
    name: data.name,
    paypalId: data.payer_id,
    email: data.emails[0].value,
  };
  return customerData;
}

//api function for getting access_token via refresh_token if access_token is expired
export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const auth: string = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
    "base64"
  );
  const url = `${base}/v1/oauth2/token`;
  const response = await fetch(url, {
    method: "post",
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await response.json();
  return data.access_token;
}
