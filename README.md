# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

# Web for testing

### https://taker-finder-kyu9ecs38-arcatukas-projects.vercel.app/

# Key Visual Elements

### Trade Summary

- Indicates a BUY trade of 18,162 Yes shares.
- Displays the price per share (70.4¢) and total transaction value ($12,795).
- Shows wallet details of the participant and a clickable transaction hash

### Makers in This Transaction

- Lists liquidity providers (makers) who facilitated the trade.
- Columns include Maker name, Side (BUY/SELL), Shares, Order status (Yes/No), Price, and Value.
- Retrieves: Participants in the transaction using OrderFilled events

# Data Insights & Functionality

- The UI retrieves transaction details from the blockchain (likely via ethers.js).
- Usernames are mapped to wallet addresses via an internal database.
- Price and trade execution details are computed using an order book or pricing engine.
