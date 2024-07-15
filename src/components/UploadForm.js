import React from 'react';

function UploadForm({
  onUpload,
  isLoading,
  file,
  setFile,
  numWinners,
  setNumWinners,
  drawNumber,
  setDrawNumber,
  fileInputRef,
  drawNumberInputRef,
  drawCategory,
  setDrawCategory
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (file && numWinners > 0 && drawNumber > 0 && drawCategory) {
      onUpload(file, numWinners, drawNumber, drawCategory);
    } else {
      alert('Заполните все поля формы');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <input
        type="file"
        id="fileInput"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        ref={fileInputRef}
      />
      <input
        type="number"
        placeholder="Количество победителей"
        value={numWinners || ''}
        onChange={(e) => setNumWinners(parseInt(e.target.value, 10) || '')}
        min="1"
      />
      <input
        type="number"
        id="drawNumberInput"
        placeholder="Номер розыгрыша"
        value={drawNumber || ''}
        onChange={(e) => setDrawNumber(parseInt(e.target.value, 10) || '')}
        min="1"
        ref={drawNumberInputRef}
      />
      <input
        type="text"
        placeholder="Категория розыгрыша"
        value={drawCategory}
        onChange={(e) => setDrawCategory(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Обработка...' : 'Определить победителей'}
      </button>
    </form>
  );
}

export default UploadForm;
