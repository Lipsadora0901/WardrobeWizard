import React, { useState, useEffect } from "react";
import "./MyOutfits.scss";
import {
  getFavoriteOutfits,
  removeFavoriteOutfit,
  getFavImages,
} from "../../utils/indexDB";
import removeIcon from "../../asset/close.svg";

function MyOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavoriteOutfits = async () => {
      try {
        const favoriteOutfits = await getFavoriteOutfits();
        setOutfits(favoriteOutfits);
      } catch (error) {
        console.log("Failed to fetch favorite outfits:", error);
      }
    };

    const fetchFavImages = async () => {
      try {
        const favImages = await getFavImages();
        setImages(favImages);
      } catch (error) {
        console.log("Failed to fetch favorite images:", error);
      }
    };

    fetchFavoriteOutfits();
    fetchFavImages();
  }, []);

  const getImageSrc = (imageId) => {
    const image = images.find((img) => img.id === imageId);
    console.log("Image ID:", imageId);
    console.log("Image Object:", image);
  
    if (image) {
      if (typeof image.blob === 'string') {
        return image.blob; // Assume it is a valid URL string
      } else if (image.blob instanceof Blob) {
        try {
          const objectUrl = URL.createObjectURL(image.blob);
          console.log("Created object URL:", objectUrl);
          return objectUrl;
        } catch (error) {
          console.error("Failed to create object URL:", error);
        }
      } else {
        console.error("Unexpected image.blob type:", typeof image.blob);
      }
    }
  
    return ""; // Return an empty string if no valid URL or Blob is found
  };

  if (outfits.length === 0) {
    return <></>;
  } else {
    return (
      <div className="my-outfits">
        <h1 className="outfit-heading">My Outfits</h1>
        <div className="outfit-gallery">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="outfit-card">
              <div className="outfit-card__header">
                <h2 className="outfit-card__text outfit-card__heading">
                  Outfit {outfit.id}
                </h2>
                <img
                  src={removeIcon}
                  alt="remove button"
                  onClick={() => {
                    removeFavoriteOutfit(outfit.id);
                  }}
                  className="icon"
                />
              </div>
              <div className="outfit-card__images">
                {outfit.clothes.map((id) => (
                  <img
                    className="outfit-card__image"
                    key={id}
                    src={getImageSrc(id)}
                    alt={id}
                  />
                ))}
              </div>
              <p className="outfit-card__text">Score: {outfit.score}</p>
              <p className="outfit-card__text">{outfit.considerations}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default MyOutfits;
