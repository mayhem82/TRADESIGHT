let database;
function open() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('gold-trail-photos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('photos', { keyPath: 'id' });
    request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); database = null; }; resolve(request.result); };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Photo storage is blocked by another open tab'));
  }).catch(error => { database = null; throw error; });
  return database;
}
async function transaction(mode, action) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', mode); let result;
    const request = action(tx.objectStore('photos'));
    request.onsuccess = () => { result = request.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = tx.onabort = () => reject(tx.error || request.error || new Error('Photo could not be stored'));
  });
}
export const photoStore = {
  list: () => transaction('readonly', store => store.getAll()),
  get: id => transaction('readonly', store => store.get(id)),
  put: record => transaction('readwrite', store => store.put(record))
};
