const folderId = '1wcGSsdrv0IDHzDiaS54Bf3RUj82wuavs';
const apiKey = 'AIzaSyA5UShZQ__DiXhhSLjgHK5XEzGSesKZtnA';

const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log("APIレスポンス:", data);
    document.body.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  })
  .catch(error => {
    console.error("エラー:", error);
    document.body.innerHTML = `<p style="color:red;">エラー: ${error}</p>`;
  });

