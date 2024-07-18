import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from PIL import Image
from io import BytesIO
import logging
import concurrent.futures

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def compress_image(image, max_size_kb, quality=85, step=5):
    """Compresses an image to be under the specified size in KB."""
    if image.mode != 'RGB':
        image = image.convert('RGB')
    original_buffer = BytesIO()
    image.save(original_buffer, format='JPEG', quality=100)  # save at best quality
    buffer_size = original_buffer.tell()  # get buffer size

    while buffer_size > max_size_kb * 1024 and quality > 0:
        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=quality)
        buffer_size = buffer.tell()
        quality -= step

    if quality <= 0:
        raise ValueError("Cannot compress image to the desired size")

    image = Image.open(buffer)
    return image, buffer

def get_all_images(url):
    """Returns all image URLs on a single `url` that end with .jpg and are not logos or icons."""
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'lxml')
    urls = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and src.endswith('.jpg'):
            full_url = urljoin(url, src)
            if not any(keyword in full_url.lower() for keyword in ['logo', 'icon']):
                urls.append(full_url)
    return urls

def download_and_compress_image(img_url, save_dir):
    """Downloads and compresses a single image."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(img_url, headers=headers)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        if img.width >= 300 and img.height >= 300:
            img, buffer = compress_image(img, max_size_kb=500)
            filename = os.path.join(save_dir, os.path.basename(urlparse(img_url).path))
            if not os.path.isfile(filename):  # avoid re-downloading
                with open(filename, 'wb') as f:
                    f.write(buffer.getvalue())
                logging.info(f"Downloaded and compressed: {filename}")
    except Exception as e:
        logging.error(f"Error downloading/compressing image {img_url}: {e}")

def crawl_and_download_images(start_url):
    """Crawl through the website and download all images that meet the criteria, and compress them."""
    visited_urls = set()
    pending_urls = {start_url}
    save_dir = 'club_monaco_images'
    os.makedirs(save_dir, exist_ok=True)

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        while pending_urls:
            current_url = pending_urls.pop()
            logging.info(f"Crawling: {current_url}")
            visited_urls.add(current_url)

            # Get all image URLs from the current page
            image_urls = get_all_images(current_url)

            # Download and compress images
            futures = [executor.submit(download_and_compress_image, img_url, save_dir) for img_url in image_urls]

            # Find all links on the current page and add them to the pending list
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(current_url, headers=headers)
            soup = BeautifulSoup(response.text, 'lxml')
            for link in soup.find_all('a'):
                href = link.get('href')
                if href and href.startswith('http'):
                    url = urljoin(current_url, href)
                    if url not in visited_urls:
                        pending_urls.add(url)

            # Wait for all image downloads to complete
            concurrent.futures.wait(futures)

# Starting URL
start_url = 'https://www.clubmonaco.ca/en/women-clothing-sweaters?ab=lpca_sweaters_3.6_w'
crawl_and_download_images(start_url)
