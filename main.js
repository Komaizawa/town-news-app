const folderId = '1Glaka8avoQqVXWY7eO7CNsThnkQ1lLxN';
const apiKey = 'AIzaSyA5UShZQ__DiXhhSLjgHK5XEzGSesKZtnA';

function listFiles() {
  gapi.client.init({ apiKey }).then(() => {
    return gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed = false`,
      fields: 'files(id, name, createdTime, webViewLink)',
      orderBy: 'createdTime desc',
    });
  }).then(response => {
    const files = response.result.files;
    displayFiles(files);
  });
}

function displayFiles(files) {
  const list = document.getElementById('fileList');
  list.innerHTML = '';
  const now = new Date();

  files.forEach(file => {
    const created = new Date(file.createdTime);
    const days = (now - created) / (1000 * 60 * 60 * 24);
    const isNew = days <= 7;

    const li = document.createElement('li');
    li.innerHTML = `<a href="${file.webViewLink}" target="_blank">${file.name}</a>` +
                   (isNew ? ` <span style="color:red;">🆕</span>` : '');
    list.appendChild(li);
  });
}

gapi.load('client', listFiles);