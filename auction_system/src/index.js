const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

function hex2Object(hex) {
  const utf8String = ethers.toUtf8String(hex);
  return JSON.parse(utf8String);
}

function obj2Hex(obj) {
  const jsonString = JSON.stringify(obj);
  return ethers.hexlify(ethers.toUtf8Bytes(jsonString));
}

let auctions = []; // Store auctions
let bids = {}; // Store bids by auction ID

// Function to handle auction actions
async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const metadata = data['metadata'];
  const sender = metadata['msg_sender'];
  const payload = data['payload'];

  let request = hex2Object(payload);

  if (!request.auctionId || !request.action) {
    const report_req = await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: obj2Hex("Invalid auction format") }),
    });

    return "reject";
  }

  // Handle auction creation
  if (request.action === "create_auction") {
    auctions.push({
      id: request.auctionId,
      item: request.details.item,
      highestBid: 0,
      highestBidder: null,
    });

    const notice_req = await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: obj2Hex({ message: "Auction created" }) }),
    });

    return "accept";
  }

  // Handle bidding
  if (request.action === "place_bid") {
    const auction = auctions.find(auction => auction.id === request.auctionId);
    if (auction) {
      const bidAmount = parseFloat(request.details.bidAmount);
      if (bidAmount > auction.highestBid) {
        auction.highestBid = bidAmount;
        auction.highestBidder = sender;

        const notice_req = await fetch(rollup_server + "/notice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: obj2Hex({ message: "Bid placed" }) }),
        });

        return "accept";
      } else {
        const notice_req = await fetch(rollup_server + "/notice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: obj2Hex({ message: "Bid too low" }) }),
        });

        return "reject";
      }
    } else {
      const report_req = await fetch(rollup_server + "/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: obj2Hex("Auction not found") }),
      });

      return "reject";
    }
  }

  return "reject";
}

// Function to handle inspection requests
async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data['payload'];
  const route = ethers.toUtf8String(payload);

  let responseObject = {};
  if (route === "auctions") {
    responseObject = JSON.stringify({ auctions });
  } else {
    responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: obj2Hex(responseObject) }),
  });

  return "accept";
}

const handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

const finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      const handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
