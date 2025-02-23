import React from "react";
import TakerFinder from "./components/TakerFinder";

function App() {
  return (
    <div className="App">
      <h1>Polygon Trade Taker Finder</h1>
      <TakerFinder transactionHash="0xc17423a5841c885c66746f38b5700def004afead5941496be5590d4be200c7c4" />
    </div>
  );
}

export default App;
