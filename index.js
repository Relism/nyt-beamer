const express = require("express");
const axios = require("axios");
const uuid = require("uuid");
const cheerio = require("cheerio"); // Import the cheerio library

const app = express();
const port = 3000;
const inMemoryHtml = {};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>NYT beamer</title>
    </head>
    <body>
      <h3>This looks sketchy and is of of dubious legality or moral justice, but I have no money to give to the New York Times</h3>
      <form method="post" action="/render">
        <label for="url">Enter Article URL:</label>
        <input type="url" name="url" required>
        <button type="submit">Render</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/render", async (req, res) => {
  const url = req.body.url;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1000.0 Safari/537.36",
      },
    });

    let htmlContent = response.data;

    // Use cheerio to manipulate the HTML
    const $ = cheerio.load(htmlContent);
    $("#top-wrapper, #bottom-wrapper").remove(); // Remove the elements with ids "top-wrapper" and "bottom-wrapper"
    htmlContent = $.html(); // Get the modified HTML as a string

    const uid = uuid.v4();
    inMemoryHtml[uid] = htmlContent;

    res.redirect(`/render/${uid}`);
  } catch (error) {
    res.status(500).send("Error rendering HTML");
  }
});

app.get("/render/:uid", (req, res) => {
  const uid = req.params.uid;
  const htmlContent = inMemoryHtml[uid];

  if (htmlContent) {
    res.send(htmlContent);
  } else {
    res.status(404).send("HTML not found for this UID");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});