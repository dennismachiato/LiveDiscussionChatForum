import React from 'react';
import './App.css';
import axios from 'axios';
// const axios = require('axios');
const uuid = require('uuid/v4');



function App() {
  const [toDoItems, updateToDoItems] = React.useState([]);

  React.useEffect(() => {
    const getToDoItems = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_TO_DO_ITEMS_API}/users`
      );

      const items = await response.json();
      if (items && Array.isArray(items) && items.length) {
        // @ts-ignore
        updateToDoItems(items);
      }
    };
    getToDoItems();
  }, []);
  const addUser = async() => {
    axios.post(`${process.env.REACT_APP_TO_DO_ITEMS_API}/users`, {
      username: 'Fred'
    })
    .then(function (response) {
      console.log(response);
    })
  }

  const addDiscussion = async() => {
    axios.post(`${process.env.REACT_APP_TO_DO_ITEMS_API}/discussions`, {
      topic: 'topic1',
      text: 'text1'
    }, {
      params: {
        id: uuid()
      }
    })
    .then(function (response) {
      console.log(response);
    })
  }

  return (
    <div>
      <div>
        <button onClick={addUser}>
          Add another user
        </button>
        <button onClick={addDiscussion}>
          Add another discussion
        </button>
      </div>
      {toDoItems && toDoItems.length
        ? toDoItems.map((item: any, i: number) => {
            return (
              <div key={i}>
                {`${item.username}`}
                <br />
              </div>
            );
          })
        : 'No discussions available'}
    </div>
  );
}

export default App;
