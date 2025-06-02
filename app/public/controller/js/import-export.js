function importDataToServer() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();

    try {
      const jsonData = JSON.parse(text);
      const response = await fetch('/api/import-statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ Импорт завершён успешно!');
        console.log(result);
      } else {
        alert('❌ Ошибка импорта: ' + result.error);
      }
    } catch (err) {
      alert('❌ Файл невалиден: ' + err.message);
    }
  };

  input.click();
}

document.addEventListener('DOMContentLoaded', () => {
  const importBtn = document.getElementById('import-button');
  if (importBtn) {
    importBtn.addEventListener('click', importDataToServer);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.import-export-button');
  if (buttons.length >= 2) {
    buttons[0].id = 'import-button';
    buttons[1].id = 'export-button';

    document.getElementById('export-button').addEventListener('click', fetchExportAndDownload);
  }
});


async function fetchExportAndDownload() {
  try {
    const response = await fetch('/api/export-statistics');
    if (!response.ok) throw new Error('Ошибка при получении данных');
    const data = await response.json();
    exportData(data);
  } catch (err) {
    alert('Ошибка экспорта: ' + err.message);
  }
}

function exportData(data, filename = 'statistics-export.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}