import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "OpenTech API running"
  });
});

app.listen(5000, () => {
  console.log("Server running");
});