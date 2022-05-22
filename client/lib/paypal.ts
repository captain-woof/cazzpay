import { mintCzp } from "./ethers";

const CLIENT_ID: string = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string;
const CLIENT_SECRET: string = process.env.PAYPAL_CLIENT_SECRET as string;
const base = "https://api-m.sandbox.paypal.com";

// CreateOrder,CaptureOrder & RefundOrder for payment  */

/**library function for creating an order
 * @params Takes an amount as a parameter
 */
export async function createOrder(amountPrice: string): Promise<string> {
  try {
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
  } catch (error: any) {
    return error.message;
  }
}
/**library function to capture the payment of the order based on orderId
 * @params Takes the order id as the parameter to capture that order
 */
export async function capturePayment(orderId: string, mintTo: string) {
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
    const captureDetails = data.purchase_units[0].payments.captures[0];
    //this amount is for creating respected amount of CZP Token
    const { value } = captureDetails.amount;
    //this captureId is for refunding the payment
    const captureId = captureDetails.id;
    try {
      await mintCzp(mintTo, value);
      return data;
    } catch (e: any) {
      // If CZP transfer fails, refund FIAT back to buyer
      await refundPayment(captureId);
      throw Error(e);
    }

  } catch (err: any) {
    throw Error(err);
  }
}

/**incase of any error happens while minting the token or the token could not generated
we have to refund the payment
 @params Takes the captureId which will be termed as a paymentId as a parameter*/
export async function refundPayment(paymentId: string) {
  try {
    const access_token: string = await generateAccessToken();
    const url = `${base}/v2/payments/captures/${paymentId}/refund`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return error.message;
  }
}

/**helper function for generating access token via paypal client id and secret
returns the access_token via paypal merchant client id and client secret*/
export async function generateAccessToken(): Promise<string> {
  try {
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
  } catch (error: any) {
    return error.message;
  }
}
/** Till here is for order payment */

/*Here are the login utilites */

/**generating access token for customer via authorization code
*takes the authorization code which we will get from the redirect url(callback url)
*as parameter
@returns the accessToken for the customer after login*/
export async function generateAccessTokenForCustomer(
  authorization: string
): Promise<PayPalToken> {
  try {
    const auth: string = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
      "base64"
    );
    const url = `${base}/v1/oauth2/token`;
    const response = await fetch(url, {
      method: "post",
      body: `grant_type=authorization_code&code=${authorization}`,
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
  } catch (error: any) {
    return error.message;
  }
}

/**fetching the customer data via access_token
 *@params takes customer access_token as a parameter
 * @returns PaypalProfile object
 */
export async function getCustomerData(accessToken: string) {
  try {
    const url = `${base}/v1/identity/oauth2/userinfo?schema=paypalv1.1`;
    const response = await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    const customerData: PaypalProfile = {
      name: data.name,
      paypalId: data.payer_id,
      email: data.emails[0].value,
    };
    return customerData;
  } catch (error: any) {
    return error.message;
  }
}

//api function for getting access_token via refresh_token if access_token is expired
//helper function to refresh the customer access_token which takes refreshToken as a parameter
export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  try {
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
  } catch (error: any) {
    return error.message;
  }
}

/** Sending money from the merchant account is complex we need to use payout rest api here
 *  we need to create payout batch,
 * two parameters needed -
 * 1. how much amount to be paid
 * 2. Seller paypal id*/
export async function sendMoneyToSeller(
  amountToPay: string | number,
  sellerId: string
) {
  try {
    const access_token: string = await generateAccessToken();
    const url = `${base}/v1/payments/payouts`;

    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        sender_batch_header: {},
        items: [
          {
            recipient_type: "PAYPAL_ID",
            amount: {
              currency: "USD",
              value: amountToPay,
            },
            receiver: sellerId,
          },
        ],
      }),
    });
    const data = await response.json();
    return data.payout_batch_id;
  } catch (error: any) {
    return error.message;
  }
}
