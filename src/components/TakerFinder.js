import React, { useState } from "react";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com/");

const abi = [
  "event OrderFilled(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
];

const iface = new ethers.Interface(abi);

const orderFilledTopic = ethers.keccak256(
  ethers.toUtf8Bytes(
    "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256)"
  )
);

const TakerFinder = ({ transactionHash }) => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taker, setTaker] = useState(null);

  const fetchTradeData = async () => {
    setLoading(true);
    setError(null);
    setEventData([]);
    setTaker(null);

    try {
      const receipt = await provider.getTransactionReceipt(transactionHash);
      if (!receipt) {
        setError("Transaction not found.");
        setLoading(false);
        return;
      }

      const logs = receipt.logs;
      const parsedEvents = [];
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();

      for (const log of logs) {
        try {
          console.log("Raw Log:", log);

          let eventDetails = { type: "Unknown Event" };

          if (log.topics[0] === orderFilledTopic) {
            console.log("✅ OrderFilled event found!");

            const decodedTopics = {
              orderHash: log.topics[1],
              maker: ethers.getAddress("0x" + log.topics[2].slice(-40)),
              taker: ethers.getAddress("0x" + log.topics[3].slice(-40)),
            };

            const decodedData = abiCoder.decode(
              ["uint256", "uint256", "uint256", "uint256", "uint256"],
              log.data
            );

            eventDetails = {
              type: "OrderFilled",
              ...decodedTopics,
              makerAssetId: decodedData[0].toString(),
              takerAssetId: decodedData[1].toString(),
              makerAmountFilled: decodedData[2].toString(),
              takerAmountFilled: decodedData[3].toString(),
              fee: decodedData[4].toString(),
            };
          } else {
            let parsedLog;
            try {
              parsedLog = iface.parseLog(log);
            } catch (e) {
              console.warn("Skipping unmatched log:", e.message);
              continue;
            }

            if (!parsedLog || !parsedLog.name) {
              console.warn("Parsed log is missing a name. Skipping...");
              continue;
            }

            console.log("Parsed Event:", parsedLog.name, parsedLog.args);

            switch (parsedLog.name) {
              case "Transfer":
                eventDetails = {
                  type: "Transfer",
                  from: parsedLog.args.from,
                  to: parsedLog.args.to,
                  value: parsedLog.args.value.toString(),
                };
                break;

              case "Approval":
                eventDetails = {
                  type: "Approval",
                  owner: parsedLog.args.owner,
                  spender: parsedLog.args.spender,
                  value: parsedLog.args.value.toString(),
                };
                break;

              case "TransferSingle":
                eventDetails = {
                  type: "TransferSingle",
                  operator: parsedLog.args.operator,
                  from: parsedLog.args.from,
                  to: parsedLog.args.to,
                  tokenId: parsedLog.args.id.toString(),
                  value: parsedLog.args.value.toString(),
                };
                break;
              default:
                break;
            }
          }

          parsedEvents.push(eventDetails);
        } catch (error) {
          console.warn("Skipping unmatched log due to error:", error.message);
        }
      }

      if (parsedEvents.length === 0) {
        setError("No relevant events found in this transaction.");
      } else {
        setEventData(parsedEvents);
      }
    } catch (error) {
      console.error("Error fetching trade data:", error);
      setError(
        "Failed to retrieve trade information. Please check the inputs."
      );
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3 style={{ textAlign: "center" }}>Polygon Trade Taker Finder</h3>
      <p>
        <strong>Transaction Hash:</strong> {transactionHash}
      </p>
      <button
        onClick={fetchTradeData}
        disabled={loading}
        style={{
          display: "block",
          margin: "10px auto",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Fetching..." : "Find Taker & Events"}
      </button>
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>
          <strong>Error:</strong> {error}
        </p>
      )}
      {taker && (
        <p style={{ color: "green", textAlign: "center", fontSize: "18px" }}>
          <strong>Taker Found:</strong> {taker}
        </p>
      )}
      {eventData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ textAlign: "center" }}>Transaction Events:</h4>
          {eventData.map((event, index) => (
            <div
              key={index}
              style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
            >
              <h5 style={{ color: "#333" }}>Type: {event.type}</h5>
              {Object.entries(event).map(
                ([key, value]) =>
                  key !== "type" && (
                    <p key={key}>
                      <strong>{key}:</strong> {value}
                    </p>
                  )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TakerFinder;
