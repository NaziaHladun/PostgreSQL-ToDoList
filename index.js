import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "admin",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const items = await db.query("SELECT * FROM items");
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body["newItem"];

  try{
    if(item.length !== 0){
      await db.query("INSERT INTO items (title ) VALUES ($1)", [item]);
      res.redirect("/");
    } else {
      const items = await db.query("SELECT * FROM items");
      res.render("index.ejs", {
        listTitle: "Today",
        listItems: items.rows,
        error: "You need to write something :)"
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const editItemId = req.body.updatedItemId;
  const editItemTitle = req.body.updatedItemTitle;

  try{
    if(editItemTitle.length !== 0){
      await db.query(
        "UPDATE items SET title = $1 WHERE id = $2 RETURNING *;",
        [editItemTitle, editItemId]
      );
      res.redirect("/");
    } else {
      await db.query(
        "DELETE FROM items WHERE id = $1",
        [editItemId]
      );
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.deleteItemId;
  try{
    await db.query(
      "DELETE FROM items WHERE id = $1",
      [checkedItemId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
