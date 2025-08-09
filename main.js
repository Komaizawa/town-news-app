const folderId = '1wcGSsdrv0IDHzDiaS54Bf3RUj82wuavs';
const apiKey = 'AIzaSyA5UShZQ__DiXhhSLjgHK5XEzGSesKZtnA';

gapi.load('client', () => {
  gapi.client.init({ apiKey }).then(listAllPDFs);
});

async function listAllPDFs() {
  try {
    const files = await fetchAllFiles();
    displayFiles(files);
  } catch (error) {
    console.error('エラー:', error);
    document.getElementById('file-list').innerText = '読み込みに失敗しました。';
  }
}

async function fetchAllFiles() {
  let files = [];
  let pageToken = null;

  do {
    const res = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf'`,
      fields: "nextPageToken, files(id, name)",
      pageToken: pageToken
    });

    // Check if res and res.result are defined before accessing res.result.files
    if (res && res.result && res.result.files) {
      files = files.concat(res.result.files);
    } else if (res && res.error) {
      // Log the error from the API response if available
      console.error('API Error:', res.error);
      throw new Error('Failed to fetch files from Google Drive API.');
    } else {
        // Handle cases where res or res.result is undefined without an explicit error object
        console.error('Unexpected API response structure:', res);
         throw new Error('Unexpected response from Google Drive API.');
    }
    pageToken = res.result ? res.result.nextPageToken : null; // Safely access nextPageToken
  } while (pageToken);

  return files;
}

function displayFiles(files) {
  const container = document.getElementById('file-list');
  container.innerHTML = '';
  if (files.length === 0) {
    container.innerText = 'ファイルが見つかりません。';
    return;
  }
  const ul = document.createElement('ul');
  files.forEach(file => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `https://drive.google.com/file/d/${file.id}/view`;
    link.textContent = file.name;
    link.target = '_blank';
    li.appendChild(link);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
