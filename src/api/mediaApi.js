import axios from 'axios'

const baseUrl = 'https://apis.voicebase.com/v2-beta';

export default {
  getMedia(token) {
    let url = `${baseUrl}/media?include=metadata`;
    return axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
      .then(response => {
        let mediaIds = [];
        let media = {};
        response.data.media.forEach(mediaItem => {
          mediaIds.push(mediaItem.mediaId);
          media[mediaItem.mediaId] = mediaItem;
        });
        return {
          mediaIds,
          media
        };
      })
      .catch(error => {
        if (error.data && error.data.errors) {
          error = error.data.errors.error;
        }
        return Promise.reject(error)
      });
  }
}