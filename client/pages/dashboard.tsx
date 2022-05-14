import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
async function getServerSideProps() {}

const Dashboard = () => {
  const [amount, setAmount] = useState<number>(1);

  return (
    <div>
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_CLIENT_ID as string,
        }}
      >
        <label>Enter amount</label>
        <input
          style={{
            marginBottom: "12px",
          }}
          type="number"
          placeholder="enter amount"
          defaultValue={1}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          min={1}
        />
        <PayPalButtons
          style={{
            layout: "horizontal",
            color: "blue",
            shape: "pill",
          }}
          forceReRender={[amount]}
          createOrder={async () => {
            try {
              const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  price: `${amount}.00`,
                }),
              });
              const data = await res.json();
              return data.id;
            } catch (e) {
              console.error(e);
            }
          }}
          onCancel={(data) => console.log("Canceled")}
          onApprove={async (data, actions) => {
            const res = await fetch(`/api/orders/${data.orderID}`, {
              method: "post",
            });
            const order = await res.json();
            console.log(order);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default Dashboard;
