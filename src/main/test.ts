import { loadSheet } from './spreadsheet';

console.log('Loading sheet');
loadSheet('C:\\Garticmon Credentials\\google-api-key-info.json')
  .then((data) => {
    console.log(data.length);
    return data;
  })
  .catch((e) => {
    console.error(e);
  });
