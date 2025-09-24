import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QrCodeGenerator = () => {
    const [text, setText] = useState('');
    const [qrValue, setQrValue] = useState('');
    const [size, setSize] = useState(200);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const generateQR = () => {
        if (!text.trim()) {
            setError('Пожалуйста, введите текст для генерации QR-кода');
            return;
        }
        
        setQrValue(text);
        setError('');
        setSuccess('QR-код успешно сгенерирован!');
        
        // Сохраняем в историю
        saveToHistory(text);
        
        // Очищаем сообщение об успехе через 3 секунды
        setTimeout(() => setSuccess(''), 3000);
    };

    const saveToHistory = (qrText) => {
        const history = JSON.parse(localStorage.getItem('qrGenerationHistory') || '[]');
        const newItem = {
            id: Date.now(),
            text: qrText,
            timestamp: new Date().toLocaleString('ru-RU'),
            date: new Date().toISOString()
        };
        
        history.unshift(newItem); // Добавляем в начало
        localStorage.setItem('qrGenerationHistory', JSON.stringify(history));
    };

    const downloadQR = () => {
        if (!qrValue) return;
        
        const svg = document.querySelector('#qr-code-canvas');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const link = document.createElement('a');
                link.download = `qr-code-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };

    const clearAll = () => {
        setText('');
        setQrValue('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="content-container">
            <h2>Генератор QR-кодов</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
                <label htmlFor="qr-text">Введите текст или URL:</label>
                <textarea
                    id="qr-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Введите текст, URL или любую информацию для создания QR-кода..."
                    rows="4"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="qr-size">Размер QR-кода:</label>
                <input
                    id="qr-size"
                    type="range"
                    min="100"
                    max="400"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                />
                <span>{size}px</span>
            </div>
            
            <div className="button-group">
                <button className="btn btn-primary" onClick={generateQR}>
                    Сгенерировать QR-код
                </button>
                <button className="btn btn-secondary" onClick={clearAll}>
                    Очистить
                </button>
            </div>
            
            {qrValue && (
                <div className="qr-display">
                    <h3>Ваш QR-код:</h3>
                    <div className="qr-code-container">
                        <QRCodeSVG
                            id="qr-code-canvas"
                            value={qrValue}
                            size={size}
                            level="M"
                            includeMargin={true}
                        />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={downloadQR}>
                            Скачать QR-код
                        </button>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                        Содержимое: {qrValue}
                    </div>
                </div>
            )}
        </div>
    );
};

export { QrCodeGenerator };