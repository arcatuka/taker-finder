import React, { useState } from "react";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com/");

const orderFilledTopic = ethers.keccak256(
  ethers.toUtf8Bytes(
    "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256)"
  )
);

const TakerFinder = () => {
  const [transactionHash, setTransactionHash] = useState("");
  const [traderAddress, setTraderAddress] = useState("");
  const [tradeDetails, setTradeDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTradeData = async () => {
    setLoading(true);
    setError(null);
    setTradeDetails([]);

    try {
      if (!ethers.isAddress(traderAddress)) {
        setError("Invalid Ethereum address.");
        setLoading(false);
        return;
      }

      const receipt = await provider.getTransactionReceipt(transactionHash);
      if (!receipt) {
        setError("Transaction not found.");
        setLoading(false);
        return;
      }

      const logs = receipt.logs;
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      let trades = [];

      for (const log of logs) {
        if (log.topics[0] === orderFilledTopic) {
          const maker = ethers.getAddress("0x" + log.topics[2].slice(-40));
          const taker = ethers.getAddress("0x" + log.topics[3].slice(-40));

          if (maker.toLowerCase() === traderAddress.toLowerCase()) {
            const decodedData = abiCoder.decode(
              ["uint256", "uint256", "uint256", "uint256", "uint256"],
              log.data
            );

            trades.push({
              orderHash: log.topics[1],
              maker,
              taker,
              makerAssetId: decodedData[0].toString(),
              takerAssetId: decodedData[1].toString(),
              makerAmountFilled: decodedData[2].toString(),
              takerAmountFilled: decodedData[3].toString(),
              fee: decodedData[4].toString(),
            });
          }
        }
      }

      if (trades.length === 0) {
        setError("No trades found where this user was a maker.");
      } else {
        setTradeDetails(trades);
      }
    } catch (error) {
      console.error("Error fetching trade data:", error);
      setError("Failed to retrieve trade information.");
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
      <h3 style={{ textAlign: "center" }}>Find All Trades for Maker</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Transaction Hash:</label>
        <input
          type="text"
          value={transactionHash}
          onChange={(e) => setTransactionHash(e.target.value)}
          placeholder="Enter transaction hash"
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Trader Address (Maker):</label>
        <input
          type="text"
          value={traderAddress}
          onChange={(e) => setTraderAddress(e.target.value)}
          placeholder="Enter trader (maker) address"
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
      </div>

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
        {loading ? "Fetching..." : "Find Trades"}
      </button>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {tradeDetails.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#eaffea",
            borderRadius: "5px",
          }}
        >
          <h4 style={{ textAlign: "center" }}>Trade History</h4>
          {tradeDetails.map((trade, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <p>
                <strong>Order Hash:</strong> {trade.orderHash}
              </p>
              <p>
                <strong>Maker:</strong> {trade.maker}
              </p>
              <p>
                <strong>Taker:</strong>{" "}
                <a
                  href={`https://www.betmoar.fun/profile/${trade.taker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {trade.taker}
                </a>
              </p>
              <p>
                <strong>Maker Asset ID:</strong> {trade.makerAssetId}
              </p>
              <p>
                <strong>Taker Asset ID:</strong> {trade.takerAssetId}
              </p>
              <p>
                <strong>Maker Amount Filled:</strong> {trade.makerAmountFilled}
              </p>
              <p>
                <strong>Taker Amount Filled:</strong> {trade.takerAmountFilled}
              </p>
              <p>
                <strong>Fee:</strong> {trade.fee}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TakerFinder;
