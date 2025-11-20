import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient();

function App() {
  const { user, signOut } = useAuthenticator();
  const [items, setItems] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  async function fetchItems() {
    const { data: bucketItems } = await client.models.BucketItem.list();
    const itemsWithImages = await Promise.all(
      bucketItems.map(async (item) => {
        if (item.imageKey) {
          const url = await getUrl({ key: item.imageKey });
          item.imageUrl = url.url.toString();
        }
        return item;
      })
    );
    setItems(itemsWithImages);
  }

  async function addItem() {
    if (!newTitle.trim()) return;

    let imageKey;
    if (file) {
      imageKey = `media/${user.userId}/${crypto.randomUUID()}-${file.name}`;
      await uploadData({ key: imageKey, data: file });
    }

    await client.models.BucketItem.create({
      title: newTitle,
      completed: false,
      imageKey: imageKey || null,
    });

    setNewTitle('');
    setFile(null);
    fetchItems();
  }

  async function toggleComplete(id, completed) {
    await client.models.BucketItem.update({ id, completed: !completed });
    fetchItems();
  }

  async function deleteItem(id, imageKey) {
    if (imageKey) await remove({ key: imageKey });
    await client.models.BucketItem.delete({ id });
    fetchItems();
  }

  return (
    <Authenticator>
      {() => (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          <h1>{user?.signInDetails?.loginId}'s Bucket List</h1>
          <button onClick={signOut} style={{ position: 'absolute', top: 20, right: 20 }}>
            Sign out
          </button>

          <div style={{ margin: '2rem 0', padding: '1rem', border: '2px dashed #ccc', borderRadius: '8px' }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What do you want to do before you kick the bucket?"
              style={{ padding: '0.8rem', fontSize: '1.1rem', width: '100%', marginBottom: '1rem' }}
            />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={addItem} style={{ padding: '0.8rem 1.5rem', marginTop: '1rem' }}>
              Add Item
            </button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item.id, item.completed)}
                  />
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none', fontSize: '1.3rem' }}>
                    {item.title}
                  </span>
                  <button onClick={() => deleteItem(item.id, item.imageKey)} style={{ marginLeft: 'auto', color: 'red' }}>
                    Delete
                  </button>
                </div>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100%', marginTop: '1rem', borderRadius: '8px' }} />
                )}
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