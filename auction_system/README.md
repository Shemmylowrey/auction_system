# Decentralized Auction System DApp

This decentralized auction system is built using Cartesi with Node.js and ethers.js. The DApp allows users to create auctions and place bids on items in a decentralized environment. It operates on the Cartesi Rollups framework, ensuring trustless execution and transparency.

## Features

- **Auction Creation**: Users can create auctions for items, specifying details such as item description.
- **Bidding**: Users can place bids on active auctions. The highest bid is tracked and updated accordingly.
- **Inspection**: Users can inspect the current state of auctions, including active auctions and the highest bids.

## Requirements

- Node.js and npm installed
- Cartesi Rollups environment set up
- Access to the Cartesi rollup server URL

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/auction-dapp.git
   cd auction-dapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following content:
   ```bash
   ROLLUP_HTTP_SERVER_URL=<Your Rollup HTTP Server URL>
   ```

4. **Start the DApp**:
   ```bash
   node app.js
   ```

## How It Works

- **Auction Creation**:
  - Users send a request with the action `create_auction` and provide the auction details (item description, etc.).
  - The auction is added to the `auctions` array and can be inspected by others.

- **Place Bid**:
  - Users can place a bid on an existing auction by sending a request with the action `place_bid`.
  - The bid is only accepted if it is higher than the current highest bid.

- **Inspect Auctions**:
  - Users can inspect all active auctions by sending an inspection request.

## Code Structure

- **app.js**: The main application logic for handling auction creation, bidding, and inspection.
- **handlers**: Contains functions to handle different types of requests (`advance_state` and `inspect_state`).

## Example Usage

- **Create an Auction**:
  ```json
  {
    "action": "create_auction",
    "auctionId": "auction1",
    "details": {
      "item": "Artwork"
    }
  }
  ```

- **Place a Bid**:
  ```json
  {
    "action": "place_bid",
    "auctionId": "auction1",
    "details": {
      "bidAmount": 100
    }
  }
  ```

- **Inspect Auctions**:
  Send an inspect request with the route `auctions` to see all active auctions.
