const folderId = '1Glaka8avoQqVXWY7eO7CNsThnkQ1lLxN';
const apiKey = 'AIzaSyA5UShZQ__DiXhhSLjgHK5XEzGSesKZtnA';

gapi.load('client', () => {
  gapi.client.init({ apiKey }).then(listAllPDFs);
});

async function listAllPDFs() {
  const allFiles = await fetchAllFiles();

  // 全フォルダ情報取得
  const allFolders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

  // フォルダ階層を構築
  const folderMap = {};
  allFolders.forEach(folder => folderMap[folder.id] = { ...folder, files: [] });

  // ファイルを該当フォルダに分類
  const allPdfs = allFiles.filter(f => f.mimeType === 'application/pdf');
  allPdfs.forEach(file => {
    const parentId = file.parents?.[0];
    if (folderMap[parentId]) {
      folderMap[parentId].files.push(file);
    } else if (parentId === folderId) {
      // ルート直下のPDF（親がルート）
      if (!folderMap[folderId]) {
        folderMap[folderId] = { id: folderId, name: 'ルートフォルダ', files: [] };
      }
      folderMap[folderId].files.push(file);
    }
  });

  // 表示
  displayGroupedFiles(folderMap);
}

async function fetchAllFiles() {
  let files = [];
  let pageToken = null;
  do {
    const res = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents or mimeType='application/vnd.google-apps.folder' or mimeType='application/pdf'`,
      fields: "nextPageToken, files(id, name, mimeType, parents, createdTime)",
      pageSize: 1000,
      pageToken: pageToken
      // 👇 ❌ここに `key: apiKey` を入れない！
    });

    if (res.result.files) {
      files = files.concat(res.result.files);
    }
    pageToken = res.result.nextPageToken;
  } while (pageToken);
  return files;
}

function displayGroupedFiles(folderMap) {
  const container = document.getElementById('file-list');
  container.innerHTML = '';

  const folders = Object.values(folderMap).filter(f => f.files.length > 0);
  folders.sort((a, b) => a.name.localeCompare(b.name));

  folders.forEach(folder => {
    const section = document.createElement('div');
    section.className = 'folder-section';

    const header = document.createElement('div');
    header.className = 'folder-header';
    header.textContent = `📁 ${folder.name}`;
    header.style.cursor = 'pointer';

    const fileList = document.createElement('ul');
    fileList.style.display = 'none'; // 初期状態は折りたたみ
    folder.files.sort((a, b) => a.name.localeCompare(b.name));

    folder.files.forEach(file => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `https://drive.google.com/file/d/${file.id}/view`;
      link.textContent = file.name;
      link.target = '_blank';
      li.appendChild(link);
      fileList.appendChild(li);
    });

    // 折りたたみ動作
    let expanded = false;
    header.addEventListener('click', () => {
      expanded = !expanded;
      fileList.style.display = expanded ? 'block' : 'none';
      header.textContent = `${expanded ? '▼' : '▶'} 📁 ${folder.name}`;
    });

    section.appendChild(header);
    section.appendChild(fileList);
    container.appendChild(section);
  });
}
