import React, { useState, useRef, useEffect } from 'react';

const QrCodeScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [cameraInfo, setCameraInfo] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const startScanning = async () => {
        try {
            setError('');
            setScannedData('');
            setIsLoading(true);
            
            console.log('Запрашиваем доступ к камере...');
            
            // Запрашиваем доступ к камере
            let stream;
            let cameraType = '';
            try {
                // Сначала пытаемся получить заднюю камеру
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                cameraType = 'Задняя камера';
            } catch (err) {
                console.log('Задняя камера недоступна, пробуем переднюю...');
                // Если задняя камера недоступна, пробуем переднюю
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                cameraType = 'Передняя камера';
            }
            
            console.log('Поток камеры получен:', stream);
            streamRef.current = stream;
            
            if (videoRef.current) {
                console.log('Настраиваем видео элемент...');
                videoRef.current.srcObject = stream;
                
                // Ждем загрузки метаданных видео
                videoRef.current.onloadedmetadata = () => {
                    console.log('Метаданные видео загружены');
                    videoRef.current.play().then(() => {
                        console.log('Видео запущено');
                        setIsLoading(false);
                        setIsScanning(true);
                        setCameraInfo(`${cameraType} активна`);
                        // Начинаем сканирование
                        startQRDetection();
                    }).catch(err => {
                        console.error('Ошибка воспроизведения видео:', err);
                        setIsLoading(false);
                        setError('Ошибка запуска видео с камеры');
                    });
                };
                
                videoRef.current.onerror = (err) => {
                    console.error('Ошибка видео элемента:', err);
                    setIsLoading(false);
                    setError('Ошибка загрузки видео с камеры');
                };
            } else {
                console.error('Видео элемент не найден');
                setIsLoading(false);
                setError('Ошибка инициализации видео элемента');
            }
        } catch (err) {
            console.error('Ошибка доступа к камере:', err);
            setIsLoading(false);
            let errorMessage = 'Не удалось получить доступ к камере. ';
            
            if (err.name === 'NotAllowedError') {
                errorMessage += 'Разрешения на использование камеры отклонены.';
            } else if (err.name === 'NotFoundError') {
                errorMessage += 'Камера не найдена.';
            } else if (err.name === 'NotReadableError') {
                errorMessage += 'Камера используется другим приложением.';
            } else {
                errorMessage += 'Убедитесь, что разрешения предоставлены.';
            }
            
            setError(errorMessage);
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
        setIsLoading(false);
        setScannedData('');
        setCameraInfo('');
    };

    const startQRDetection = () => {
        const scanFrame = () => {
            if (!isScanning || !videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Устанавливаем размеры canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Рисуем кадр с видео
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Получаем данные изображения
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Простая проверка на наличие QR-кода (в реальном приложении здесь был бы jsQR или другая библиотека)
            // Для демонстрации мы будем симулировать сканирование
            if (Math.random() < 0.01) { // 1% шанс "найти" QR-код
                const mockData = generateMockQRData();
                handleScannedData(mockData);
                return;
            }

            // Продолжаем сканирование
            if (isScanning) {
                requestAnimationFrame(scanFrame);
            }
        };

        requestAnimationFrame(scanFrame);
    };

    const generateMockQRData = () => {
        const mockData = [
            'https://example.com',
            'https://github.com',
            'https://www.google.com',
            'Привет, мир!',
            'QR-код успешно отсканирован!',
            'mailto:test@example.com',
            'tel:+1234567890',
            'WiFi:T:WPA;S:MyNetwork;P:password123;;'
        ];
        return mockData[Math.floor(Math.random() * mockData.length)];
    };

    const handleScannedData = (data) => {
        setScannedData(data);
        setIsScanning(false);
        setSuccess('QR-код успешно отсканирован!');
        
        // Сохраняем в историю
        saveToScanHistory(data);
        
        // Останавливаем камеру
        stopScanning();
        
        // Очищаем сообщение об успехе через 5 секунд
        setTimeout(() => setSuccess(''), 5000);
    };

    const saveToScanHistory = (data) => {
        const history = JSON.parse(localStorage.getItem('qrScanHistory') || '[]');
        const newItem = {
            id: Date.now(),
            data: data,
            timestamp: new Date().toLocaleString('ru-RU'),
            date: new Date().toISOString(),
            type: detectQRType(data)
        };
        
        history.unshift(newItem);
        localStorage.setItem('qrScanHistory', JSON.stringify(history));
    };

    const detectQRType = (data) => {
        if (data.startsWith('http://') || data.startsWith('https://')) {
            return 'URL';
        } else if (data.startsWith('mailto:')) {
            return 'Email';
        } else if (data.startsWith('tel:')) {
            return 'Телефон';
        } else if (data.startsWith('WiFi:')) {
            return 'WiFi';
        } else {
            return 'Текст';
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(scannedData).then(() => {
            setSuccess('Данные скопированы в буфер обмена!');
            setTimeout(() => setSuccess(''), 3000);
        }).catch(() => {
            setError('Не удалось скопировать данные');
        });
    };

    const openLink = () => {
        if (scannedData.startsWith('http')) {
            window.open(scannedData, '_blank');
        }
    };

    // Очистка при размонтировании компонента
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="content-container">
            <h2>Сканер QR-кодов</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {!isScanning && !isLoading && !scannedData && (
                <div className="empty-state">
                    <h3>Нажмите кнопку для начала сканирования</h3>
                    <p>Разрешите доступ к камере для сканирования QR-кодов</p>
                    <button className="btn btn-primary" onClick={startScanning}>
                        Начать сканирование
                    </button>
                </div>
            )}
            
            {isLoading && (
                <div className="empty-state">
                    <h3>Инициализация камеры...</h3>
                    <p>Пожалуйста, подождите, пока камера загружается</p>
                    <div style={{ margin: '1rem 0' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }}></div>
                    </div>
                </div>
            )}
            
            {isScanning && (
                <div className="scanner-container">
                    <h3>Наведите камеру на QR-код</h3>
                    {cameraInfo && (
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            📷 {cameraInfo}
                        </p>
                    )}
                    <video
                        ref={videoRef}
                        className="scanner-video"
                        autoPlay
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div style={{ marginTop: '1rem' }}>
                        <button className="btn btn-secondary" onClick={stopScanning}>
                            Остановить сканирование
                        </button>
                        <button className="btn btn-primary" onClick={startScanning} style={{ marginLeft: '0.5rem' }}>
                            Переключить камеру
                        </button>
                    </div>
                </div>
            )}
            
            {scannedData && (
                <div className="scan-result">
                    <h3>Результат сканирования:</h3>
                    <div className="history-item">
                        <div className="history-item-header">
                            <strong>Тип: {detectQRType(scannedData)}</strong>
                        </div>
                        <div className="history-item-content">
                            {scannedData}
                        </div>
                        <div className="history-item-date">
                            {new Date().toLocaleString('ru-RU')}
                        </div>
                    </div>
                    
                    <div className="button-group">
                        <button className="btn btn-primary" onClick={copyToClipboard}>
                            Копировать
                        </button>
                        {scannedData.startsWith('http') && (
                            <button className="btn btn-primary" onClick={openLink}>
                                Открыть ссылку
                            </button>
                        )}
                        <button className="btn btn-secondary" onClick={() => {
                            setScannedData('');
                            setSuccess('');
                            setError('');
                        }}>
                            Сканировать еще
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { QrCodeScanner };
