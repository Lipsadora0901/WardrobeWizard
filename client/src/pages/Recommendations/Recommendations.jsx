import React, { useEffect, useState } from "react";
import {
  getImages,
  storeFavImages,
  saveFavoriteOutfit,
  removeFavoriteOutfit,
} from "../../utils/indexDB";
import "./Recommendations.scss";
import { getJson } from "../../utils/getJson";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fasHeart } from "@fortawesome/free-solid-svg-icons";

const Recommendations = ({ response, style }) => {
  const [favoriteStatus, setFavoriteStatus] = useState({}); // State to track favorites
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

  // Initialize favorite status from outfits
  useEffect(() => {
    const initialStatus = {};
    getJson(response).forEach((outfit) => {
      initialStatus[outfit.outfit_id] = false; // Default all to not favorite
    });
    setFavoriteStatus(initialStatus);
  }, [response]);

  // Fetch images from IndexedDB
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const storedImages = await getImages();
        console.log("Fetched images from IndexedDB:", storedImages);
        setImages(storedImages || []);
      } catch (error) {
        console.log("Error fetching images:", error);
      }
    };
    fetchImages();
  }, []);

  // toggle heart when user clicks, and save or remove outfit in IndexedDB database
  const toggleHeart = async (favOutfit) => {
    const currentStatus = favoriteStatus[favOutfit.outfit_id];
    const newStatus = {
      ...favoriteStatus,
      [favOutfit.outfit_id]: !currentStatus,
    };
    setFavoriteStatus(newStatus);
    if (!currentStatus) {
      try {
        const imagefiles = favOutfit.clothes.map((imageID) =>
          getImageFile(imageID)
        );
        console.log("imagefiles", imagefiles);
        await storeFavImages(imagefiles);
        await saveFavoriteOutfit(favOutfit);
        setError("");
      } catch (error) {
        console.error("Failed to save your favorite outfit", error);
        setError("Failed to save your favorite outfit");
      }
    } else {
      try {
        console.log("Attempt to remove image from db");
        await removeFavoriteOutfit(favOutfit.outfit_id);
        setError("");
      } catch (error) {
        console.error("Failed to remove your favorite outfit", error);
        setError("Failed to remove your favorite outfit, please try again");
      }
    }
  };

  const navigate = useNavigate();
  const outfits = getJson(response); // Parse JSON string using getJson function

  // find the src of images stored in indexDB
  const getImageSrc = (imageId) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      console.log(`Creating object URL for image ID ${imageId}`, image);
      if (image.blob instanceof Blob) {
        const url = URL.createObjectURL(image.blob);
        console.log(`Object URL for image ID ${imageId}: ${url}`);
        return url;
      } else {
        console.log(`Invalid blob for image ID ${imageId}`, image.blob);
        return "";
      }
    } else {
      console.log(`Image ID ${imageId} not found`);
      return "";
    }
  };

  const getImageFile = (imageId) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      console.log(`Found image for ID ${imageId}`, image);
    } else {
      console.log(`No image found for ID ${imageId}`);
    }
    return image ? image : null;
  };

  if (images.length === 0 || !response || response.length === 0) {
    // case1: no response from api
    return <div className="outfit__loading">Loading...</div>;
  } else if (!outfits || outfits.length === 0) {
    // case2: there are response, but gpt failed to answer the request, outfits in null
    return (
      <div className="recommendations">
        <h1 className="outfit__heading">
          Oops, our AI Advisor just sloped away
        </h1>
        <p className="outfit__error-text">{response}</p>
        <button className="primary__btn" onClick={() => navigate(-1)}>
          Try Again
        </button>
      </div>
    );
  } else {
    // case3: success request, outfits json data retrieved
    return (
      <div className="recommendations">
        <h1 className="outfit-heading">
          Here are some outfit ideas to look {style.toLowerCase()}:
        </h1>
        <div className="error">{error.length > 0 && error}</div>
        <div className="outfit-gallery">
          {outfits.map((outfit) => (
            <div key={outfit.outfit_id} className="outfit-card">
              <div className="outfit-card__header">
                <h2 className="outfit-card__text outfit-card__heading">
                  Outfit {outfit.outfit_id}
                </h2>
                <div onClick={() => toggleHeart(outfit)}>
                  <FontAwesomeIcon
                    className="icon"
                    icon={
                      favoriteStatus[outfit.outfit_id] ? fasHeart : farHeart
                    }
                    style={{
                      color: favoriteStatus[outfit.outfit_id]
                        ? "pink"
                        : "#5c667e",
                    }}
                  />
                </div>
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
        <button className="primary__btn" onClick={() => navigate(-1)}>
          Try New Looks
        </button>
      </div>
    );
  }
};

export default Recommendations;
