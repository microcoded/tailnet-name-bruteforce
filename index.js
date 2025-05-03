import fetch from 'node-fetch';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const myToken = "CSRF TOKEN GOES HERE";
const myCookie = "COOKIE GOES HERE";
const wantedTerm = "DESIRED TERM GOES HERE"

const promptUser = (tcd) => {
  return new Promise((resolve) => {
    rl.question(`Found match: ${tcd}. Do you want to set this name? (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
};

const setTailnetName = async (tcd, token) => {
  try {
    const response = await fetch("https://login.tailscale.com/admin/api/tcd", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en;q=0.5",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-csrf-token": myToken,
        "cookie": myCookie,
        "Referer": "https://login.tailscale.com/admin/dns",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": `{"tcd":"${tcd}","token":"${token}"}`,
      "method": "POST"
    });

    if (response.ok) {
      console.log(`Successfully set the name: ${tcd}`);
      process.exit(0);
    } else {
      console.error('Failed to set the name');
    }
  } catch (error) {
    console.error('Error setting tailnet name:', error);
  }
};

(async () => {
  while (true) {
    const res = await fetch("https://login.tailscale.com/admin/api/tcd/offers", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "cookie": myCookie,
        "Referer": "https://login.tailscale.com/admin/dns",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });

    const data = (await res.json()).data;

    for (const tcd of data.tcds) {
      console.log(tcd.tcd);
      if (tcd.tcd.includes(wantedTerm)) {
        const shouldSet = await promptUser(tcd.tcd);
        if (shouldSet) {
          await setTailnetName(tcd.tcd, myToken); 
        }
      }
    }

	  await new Promise(resolve => setTimeout(resolve, 1));
  }
})();
