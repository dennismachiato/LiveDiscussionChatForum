require('dotenv').config();

// Express App Setup
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuid = require('uuid/v4');

// Config
const config = require('./config');

// Initialization
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres client
const { Pool } = require('pg');
const pgClient = new Pool({
  user: config.pgUser,
  host: config.pgHost,
  database: config.pgDatabase,
  password: config.pgPassword,
  port: config.pgPort
});
pgClient.on('error', () => console.log('Lost Postgres connection'));

// Create Users table
pgClient
  .query(
    `
  CREATE TABLE IF NOT EXISTS users (
    id uuid,
    username TEXT NOT NUll,
    PRIMARY KEY (id)
  )
`
  )
  .catch(err => console.log(err));

// Create discussions table
pgClient
  .query(
    `
  CREATE TABLE IF NOT EXISTS discussions (
    id uuid,
    creator_id uuid,
    topic TEXT NOT NUll,
    text TEXT NOT NULL,
    creation_time TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
  )
`
  )
  .catch(err => console.log(err));


// Express route handlers
app.get('/test', (req, res) => {
  res.send('Working!');
});

// Get all users
app.get('/v1/users', async (req, res) => {
  const users = await pgClient.query('SELECT * FROM users');
  res.status(200).send(users.rows);
});

// Get a single user
app.get('/v1/users', async (req, res) => {
  const id = req.params.id;

  const items = await pgClient
    .query('SELECT * FROM users WHERE id = $1', [id])
    .catch(e => {
      res
        .status(500)
        .send(`Encountered an internal error when fetching item with ID ${id}`);
    });

  res.status(200).send(items.rows);
});

// Create a user
app.post('/v1/users', async (req, res) => {
  const { username } = req.body;
  const id = uuid();
  const user = await pgClient
    .query(
      `INSERT INTO users (id, username) VALUES 
    ($1, $2)`,
      [id, username]
    )
    .catch(e => {
      res
        .status(500)
        .send('Encountered an internal error when creating an item');
    });

  res.status(201).send(`User created with ID: ${id}`);
});

// Get all discussion posts
app.get('/v1/discussions', async (req, res) => {
  const discussions = await pgClient.query('SELECT * FROM discussions');
  res.status(200).send(discussions.rows);
});

// Get all of 1 user's discussion posts
app.get('/v1/users/:id/discussions', async (req, res) => {
  const id = req.params.id;
  const discussions = await pgClient.query('SELECT * FROM discussions WHERE creater_id = $1', [id]).catch(e => {
    res.status(500).send('Encountered an internal error when retrieving discusion posts.')
  });
  res.status(200).send(discussions.rows);
});


// Create a discussion post
app.post('/v1/discussions', async (req, res) => {
  const user_id = req.params.id;
  const { topic, text } = req.body;
  const discussion_id = uuid();
  const user = await pgClient
    .query(
      `INSERT INTO discussions (id, topic, text, creator_id) VALUES 
    ($1, $2, $3, $4)`,
      [discussion_id, topic, text, user_id]
    )
    .catch(e => {
      res
        .status(500)
        .send('Encountered an internal error when creating an item');
    });

  res.status(201).send(`Discussion post created with ID: ${discussion_id}`);
});


// // Update a todo item
// app.put('/v1/items/:id', async (req, res) => {
//   const id = req.params.id;
//   const { username } = req.body;

//   await pgClient
//     .query(
//       `
//     UPDATE items SET item_name = $1, complete = $2 WHERE id = $3
//   `,
//       [item_name, complete, id]
//     )
//     .catch(e => {
//       res
//         .status(500)
//         .send('Encountered an internal error when updating an item');
//     });

//   res.status(200).send(`Item updated with ID: ${id}`);
// });

// // Delete a todo item
// app.delete('/v1/items/:id', async (req, res) => {
//   const id = req.params.id;

//   await pgClient.query('DELETE FROM items WHERE id = $1', [id]).catch(e => {
//     res.status(500).send('Encountered an internal error when deleting an item');
//   });

//   res.status(200).send(`Item deleted with ID: ${id}`);
// });

// Server
const port = process.env.PORT || 3001;
const server = http.createServer(app);
server.listen(port, () => console.log(`Server running on port ${port}`));
