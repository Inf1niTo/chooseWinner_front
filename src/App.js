import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import WinnersList from './components/WinnersList';
import ErrorAlert from './components/ErrorAlert';
import './App.css';

function App() {
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [drawData, setDrawData] = useState(null);
  const [file, setFile] = useState(null);
  const [numWinners, setNumWinners] = useState(0);
  const [drawNumber, setDrawNumber] = useState(0);
  const [drawCategory, setDrawCategory] = useState('');
  const [allWinners, setAllWinners] = useState([]);

  const fileInputRef = useRef(null);
  const drawNumberInputRef = useRef(null);


  const [showCurrentWinners, setShowCurrentWinners] = useState(true);

  const noiseCanvasRef = useRef(null);

  const handleToggleWinners = (showCurrent) => {
    setShowCurrentWinners(showCurrent);
  };

  useEffect(() => {
    noise();
  }, []);

  const noise = () => {
    let canvas, ctx;
    let wWidth, wHeight;
    let noiseData = [];
    let frame = 0;
    let loopTimeout;

    const createNoise = () => {
      const idata = ctx.createImageData(wWidth, wHeight);
      const buffer32 = new Uint32Array(idata.data.buffer);
      const len = buffer32.length;

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.5) {
          buffer32[i] = 0xff000000;
        }
      }

      noiseData.push(idata);
    };

    const paintNoise = () => {
      if (frame === 9) {
        frame = 0;
      } else {
        frame++;
      }

      ctx.putImageData(noiseData[frame], 0, 0);
    };

    const loop = () => {
      paintNoise(frame);

      loopTimeout = window.setTimeout(() => {
        window.requestAnimationFrame(loop);
      }, 1000 / 25);
    };

    const setup = () => {
      wWidth = window.innerWidth;
      wHeight = window.innerHeight;

      canvas.width = wWidth;
      canvas.height = wHeight;

      for (let i = 0; i < 10; i++) {
        createNoise();
      }

      loop();
    };

    let resizeThrottle;

    const reset = () => {
      window.addEventListener('resize', () => {
        window.clearTimeout(resizeThrottle);

        resizeThrottle = window.setTimeout(() => {
          window.clearTimeout(loopTimeout);
          setup();
        }, 200);
      }, false);
    };


    const init = (() => {
      canvas = document.getElementById('noise');
      ctx = canvas.getContext('2d');

      setup();
    })();
  };

const handleUpload = async (file, numWinners, drawNumber, drawCategory) => {
    setIsLoading(true);
    setError(null);
    try {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('/api/upload', formData);

        const response = await axios.post('/api/calculate_winners', {
            num_winners: numWinners,
            draw_number: drawNumber,
            draw_category: drawCategory,
        });

        if (response.data.message) {
            const allWinnersResponse = await axios.get(`/api/winners/all/${drawNumber}`);
            setAllWinners(allWinnersResponse.data);

            const winnersResponse = await axios.get(`/api/winners/${drawNumber}?count=${numWinners}`);
            setWinners(winnersResponse.data);
            setTotalParticipants(response.data.total_participants);

            setDrawData({
                course: response.data.course,
                step: response.data.step,
                totalParticipants: response.data.total_participants,
                drawNumber: drawNumber,
                drawDate: new Date().toLocaleDateString(),
            });

            setShowButtons(true);
        } else {
            setError(response.data.error);
        }
    } catch (error) {
        setError('Ошибка при обращении к API');
    } finally {
        setIsLoading(false);
    }
};

  const handleNewDraw = () => {
    setFile(null);
    setNumWinners(0);
    setDrawNumber(1);
    setWinners([]);
    setTotalParticipants(0);
    setError(null);
    setShowButtons(false);
    setDrawCategory('');
    setAllWinners([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (drawNumberInputRef.current) {
      drawNumberInputRef.current.value = "";
    }
  };

const handleDownloadReport = () => {
  if (drawData) {
    // --- Формирование данных для отчета ---
    const reportData = {
      Sheet1: [
        { Название: 'Курс', Значение: drawData.course },
        { Название: 'Шаг выбора', Значение: drawData.step },
        { Название: 'Всего участников', Значение: drawData.totalParticipants },
      ],
      'Текущие победители': winners,
      'Все победители': allWinners,
    };

    // --- Отправка данных на сервер для создания Excel ---
    axios.post('/api/generate_report', reportData, {
      responseType: 'blob', // Ожидаем ответ в виде двоичных данных
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Отчет_${drawData.drawDate}_${drawData.drawNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      setError('Ошибка при создании отчета');
      console.error(error);
    });
  }
};

return (
    <div className="app-wrapper">
      <canvas ref={noiseCanvasRef} id="noise" className="noise"></canvas>
      <div className="balls">
        <div className="ball-left-top"></div>
        <div className="ball-right-bottom"></div>
      </div>
      <div className="app-container">
        <h1>Выбор победителей</h1>
        <UploadForm
          onUpload={handleUpload}
          isLoading={isLoading}
          file={file}
          setFile={setFile}
          numWinners={numWinners}
          setNumWinners={setNumWinners}
          drawNumber={drawNumber}
          setDrawNumber={setDrawNumber}
          fileInputRef={fileInputRef}
          drawNumberInputRef={drawNumberInputRef}
          drawCategory={drawCategory}
          setDrawCategory={setDrawCategory}
        />
        {error && <ErrorAlert message={error} />}

        {totalParticipants > 0 && (
          <div className="participant-info">
            <p style={{ marginBottom: '10px' }}>Участников: {totalParticipants};  Выбрано победителей: {winners.length}</p>

          </div>
        )}

        {showButtons && (
          <div className="winner-tabs">
            <button
              onClick={() => handleToggleWinners(true)}
              className={showCurrentWinners ? 'active' : ''}
            >
              Текущие победители
            </button>
            <button
              onClick={() => handleToggleWinners(false)}
              className={!showCurrentWinners ? 'active' : ''}
            >
              Все победители розыгрыша
            </button>
          </div>
        )}

        <WinnersList winners={showCurrentWinners ? winners : allWinners} />

        {showButtons && (
          <div className="buttons">
            <button onClick={handleNewDraw}>Начать новый розыгрыш</button>
            <button onClick={handleDownloadReport}>Скачать отчет</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
