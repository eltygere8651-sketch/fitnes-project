const fs = require("fs");
const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const dbId = config.firestoreDatabaseId || "(default)";
fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/system_settings/telegram`)
  .then(res => res.json())
  .then(console.log);
