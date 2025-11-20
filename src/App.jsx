import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient();

function App() {
  const [items, setItems] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  // Load items when logged in
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data: bucketItems } = await client.models.BucketItem.list();
    setItems(bucketItems);
  }

  async function addItem() {
    if (!newTitle.trim()) return;
    await client.models.BucketItem.create({
      title: newTitle,
      completed: false,
    });
    setNewTitle('');
    fetchItems();
  }

  async function toggleComplete(id, completed) {
    await client.models.BucketItem.update({
      id,
      completed: !completed,
    });
    fetchItems();
  }

  async function deleteItem(id) {
    await client.models.BucketItem.delete({ id });
    fetchItems();
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>{user?.signInDetails?.loginId}'s Bucket List </h1>
          <button onClick={signOut} style={{ position: 'absolute', top: 20, right: 20 }}>
            Sign out
          </button>

          <div style={{ marginBottom: '2rem' }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="What do you want to do before you kick the bucket?"
              style={{ padding: '0.8rem', fontSize: '1.1rem', width: '70%' }}
            />
            <button onClick={addItem} style={{ padding: '0.8rem 1.5rem', marginLeft: '1rem' }}>
              Add
            </button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ margin: '1rem 0', fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(item.id, item.completed)}
                />
                <span style={{ marginLeft: '1rem', textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.title}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{ marginLeft: 'auto', color: 'red' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {items.length === 0 && <p>No items yet — add something awesome!</p>}
        </div>
      )}
    </Authenticator>
  );
}

export default App;