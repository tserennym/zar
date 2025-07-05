const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    await db.collection("ads").add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).send({ message: "OK" });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

app.get("/list", async (req, res) => {
  const ads = await db.collection("ads")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();
  res.send(ads.docs.map(d => d.data()));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
