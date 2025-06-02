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

// Навесить обработчик на кнопку "Экспорт"
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.import-export-button');
  if (buttons.length >= 2) {
    buttons[1].addEventListener('click', fetchExportAndDownload);
  }
});
