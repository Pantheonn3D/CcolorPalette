// src/utils/seo.js
export const submitToIndexNow = async (urls) => {
    try {
      await fetch('/.netlify/functions/indexnow-submit', {
        method: 'POST',
        body: JSON.stringify({ urls: Array.isArray(urls) ? urls : [urls] }),
      });
    } catch (err) {
      console.error('IndexNow submission failed', err);
    }
  };