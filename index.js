const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json()); // from midle ware to handle the data . to process the json came from the body ,while using the post method
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const bookId = request.params.bookId;
  const getBookQuery = `
    SELECT
        *
    FROM
        book
    WHERE
        book_id = ${bookId};
  `;
  const book = await db.get(getBookQuery);

  response.send(book);
});

//posting an book
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  // to get multiple parameters of the book we have to done the object destructring

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbRsponse = await db.run(addBookQuery);
  //we create an book that book has an primary we call it as book id
  const bookId = dbRsponse.lastId;
  response.send({ bookId: bookId });
});

//update book api
app.put("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;

  // destructure
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  // form sqlqueary
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  await db.run(updateBookQuery);
  response.send("Book upddated successfully");
});
// delete book api
app.delete("/book/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("book deleted");
});
// getting books by authors

app.get("/authors/:authorsId/books/", async (request, response) => {
  try {
    const { authorId } = request.params;
    //write sql quary to get books
    const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        book
    WHERE
        author_id = ${authorId};`;
    const booksArray = await db.all(getAuthorBooksQuery);
    response.send(booksArray);
  } catch (e) {
    console.log(`this queary has returned ${e.message}`);
  }
});
