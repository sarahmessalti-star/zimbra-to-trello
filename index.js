import fetch from "node-fetch";
import ical from "node-ical";
import fs from "fs";

const ZIMBRA_ICS = process.env.ZIMBRA_ICS;
const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_LIST_ID = process.env.TRELLO_LIST_ID;

const processedFile = "processed.json";

// Charger événements déjà traités
let processed = [];
if (fs.existsSync(processedFile)) {
  processed = JSON.parse(fs.readFileSync(processedFile));
}

// Télécharger calendrier
const res = await fetch(ZIMBRA_ICS);
const text = await res.text();
const data = ical.parseICS(text);

for (let k in data) {
  const ev = data[k];

  if (ev.type === "VEVENT") {
    if (processed.includes(ev.uid)) continue;

    const url = `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;

    const body = new URLSearchParams({
      name: ev.summary,
      idList: TRELLO_LIST_ID,
      due: ev.start.toISOString(),
      desc: ev.description || ""
    });

    await fetch(url, { method: "POST", body });

    processed.push(ev.uid);
    console.log("Carte créée :", ev.summary);
  }
}

// Sauvegarder UID traités
fs.writeFileSync(processedFile, JSON.stringify(processed));
