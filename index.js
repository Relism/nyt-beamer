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
    <title>NYT Beamer</title>
    <!-- Add Bootstrap stylesheet -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        /* Center align everything */
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
        }
        .form-container {
            max-width: 400px;
            margin: 0 auto;
        }
        h4 {
            font-size: 24px;
            font-weight: normal;
        }
        .form-control {
            text-align: center;
        }
        .form-text {
            font-size: 16px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1 class="display-3">NYT Beamer</h1>
        <h4 class="mb-3">This looks sketchy and is of dubious legality, but I have no money to give to the New York Times.</h4>
        <div class="form-container">
            <form method="post" action="/render">
                <label for="url">Enter Article URL:</label>
                <input type="url" class="form-control" name="url" required>
                <small class="form-text text-muted mt-2">This tool scrapes articles from NYT's servers, removing the paywall and most ads, before redirecting you to a temporary URL to view the content. It's temporary, since it self destructs after some time, but it will still give you plenty of time to read the article with no rush.</small>
                <button type="submit" class="btn btn-primary mt-2">Render</button>
            </form>
        </div>
    </div>
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
