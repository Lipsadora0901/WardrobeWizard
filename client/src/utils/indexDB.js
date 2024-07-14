import { openDB } from "idb";

// Function to initialize the IndexedDB
async function initDB() {
  const dbName = "WiseWardro1";
  const dbVersion = 1;
  try {
    const db = await openDB(dbName, dbVersion, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(
          `Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`
        );
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("favorites")) {
          db.createObjectStore("favorites", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("favImages")) {
          db.createObjectStore("favImages", { keyPath: "id" });
        }
      },
    });
    return db;
  } catch (error) {
    throw new Error(`IndexedDB error: ${error}`);
  }
}

// Function to store images in IndexedDB
async function storeImages(images, formDataKeys) {
  try {
    const db = await initDB();
    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");

    images.forEach((image, index) => {
      const formDataKey = formDataKeys[index];
      console.log(`Storing image with ID ${formDataKey}`);
      store.put({ id: formDataKey, blob: image.file });
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log("All files have been stored in IndexedDB.");
        resolve();
      };

      transaction.onerror = (event) => {
        reject("IndexedDB transaction error: " + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error("Error storing images:", error);
  }
}

// Function to store images in the favImages store of IndexedDB
async function storeFavImages(images) {
  try {
    const db = await initDB();
    const transaction = db.transaction("favImages", "readwrite");
    const store = transaction.objectStore("favImages");

    for (const image of images) {
      await store.put(image);
    }

    await transaction.done;
    console.log("All favorite images have been stored in IndexedDB.");
  } catch (error) {
    console.error("Error storing favorite images:", error);
  }
}

// Function to retrieve favorite images from IndexedDB
async function getFavImages() {
  try {
    const db = await initDB();
    const transaction = db.transaction("favImages", "readonly");
    const store = transaction.objectStore("favImages");
    const images = await store.getAll();

    return images.map(img => ({
      id: img.id,
      blob: img.blob, // Return blob instead of URL
    }));
  } catch (error) {
    console.error("Error getting favorite images:", error);
  }
}

// Function to retrieve images from IndexedDB
async function getImages() {
  try {
    const db = await initDB();
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    const images = await store.getAll();

    console.log("Retrieved images from IndexedDB:", images); // Log retrieved images
    return images.map(img => ({
      id: img.id,
      blob: img.blob,
    }));
  } catch (error) {
    console.error("Error getting images:", error);
  }
}

// Function to clear images from IndexedDB
async function clearImages() {
  try {
    const db = await initDB();
    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");
    await store.clear();
    console.log("All images have been cleared from IndexedDB.");
  } catch (error) {
    console.error("Error clearing images:", error);
  }
}

// Function to save an outfit to the favorites store in IndexedDB
async function saveFavoriteOutfit(outfit) {
  try {
    const db = await initDB();
    const transaction = db.transaction("favorites", "readwrite");
    const store = transaction.objectStore("favorites");

    const outfitToSave = { ...outfit, id: outfit.outfit_id };
    delete outfitToSave.outfit_id;

    await store.put(outfitToSave);
    console.log(`Outfit ${outfitToSave.id} saved successfully.`);
  } catch (error) {
    console.error("Error saving the outfit to IndexedDB:", error);
  }
}

// Function to remove an outfit from the favorites store in IndexedDB
async function removeFavoriteOutfit(outfitId) {
  try {
    const db = await initDB();
    const transaction = db.transaction("favorites", "readwrite");
    const store = transaction.objectStore("favorites");
    await store.delete(outfitId);
    console.log(`Outfit with id ${outfitId} removed from favorites.`);
  } catch (error) {
    console.error("Error removing outfit from favorites:", error);
  }
}

// Function to check if there are images in the IndexedDB
async function hasImages() {
  try {
    const db = await initDB();
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    const count = await store.count();
    return count > 0;
  } catch (error) {
    console.error("Error checking for images:", error);
  }
}

// Function to retrieve all outfits from the favorites store in IndexedDB
async function getFavoriteOutfits() {
  try {
    const db = await initDB();
    const transaction = db.transaction("favorites", "readonly");
    const store = transaction.objectStore("favorites");
    return await store.getAll();
  } catch (error) {
    console.error("Error getting favorite outfits:", error);
  }
}

// Function to retrieve all image blobs from IndexedDB
async function getImageBlobs() {
  try {
    const db = await initDB();
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    return await store.getAll();
  } catch (error) {
    console.error("Error getting image blobs:", error);
  }
}

export {
  initDB,
  storeImages,
  getImages,
  getImageBlobs,
  hasImages,
  clearImages,
  saveFavoriteOutfit,
  removeFavoriteOutfit,
  getFavoriteOutfits,
  storeFavImages,
  getFavImages,
};