import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const GenerationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            const savedHistory = JSON.parse(localStorage.getItem('qrGenerationHistory') || '[]');
            setHistory(savedHistory);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = (id) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('qrGenerationHistory', JSON.stringify(updatedHistory));
    };

    const clearAllHistory = () => {
        if (window.confirm('Вы уверены, что хотите удалить всю историю генерации?')) {
            setHistory([]);
            localStorage.removeItem('qrGenerationHistory');
        }
    };

    const showQRCode = (item) => {
        setSelectedItem(item);
        setShowQRModal(true);
    };

    const downloadQR = (item) => {
        const svg = document.getElementById(`qr-canvas-${item.id}`);
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
                link.download = `qr-code-${item.id}.png`;
                link.href = canvas.toDataURL();
                link.click();
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Текст скопирован в буфер обмена!');
        }).catch(() => {
            alert('Не удалось скопировать текст');
        });
    };

    const regenerateQR = (item) => {
        // Переходим к генератору с предзаполненным текстом
        // В реальном приложении здесь можно было бы использовать контекст или роутинг
        alert(`Для регенерации QR-кода перейдите в раздел "Генерировать QR код" и вставьте текст: ${item.text}`);
    };

    if (loading) {
        return (
            <div className="content-container">
                <h2>История генерации</h2>
                <div className="empty-state">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>История генерации</h2>
                {history.length > 0 && (
                    <button className="btn btn-danger" onClick={clearAllHistory}>
                        Очистить всю историю
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="empty-state">
                    <h3>История пуста</h3>
                    <p>Здесь будут отображаться все сгенерированные QR-коды</p>
                    <p>Перейдите в раздел "Генерировать QR код" для создания первого QR-кода</p>
                </div>
            ) : (
                <div className="history-list">
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Всего записей: {history.length}
                    </p>
                    
                    {history.map((item, index) => (
                        <div key={item.id} className="history-item">
                            <div className="history-item-header">
                                <strong>#{index + 1} - {new Date(item.date).toLocaleDateString('ru-RU')}</strong>
                                <div className="item-actions">
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => showQRCode(item)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                    >
                                        Показать QR
                                    </button>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => deleteItem(item.id)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                            
                            <div className="history-item-content">
                                <strong>Содержимое:</strong> {item.text}
                            </div>
                            
                            <div className="history-item-date">
                                Создано: {item.timestamp}
                            </div>
                            
                            <div className="item-actions" style={{ marginTop: '0.5rem' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => copyToClipboard(item.text)}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                >
                                    Копировать текст
                                </button>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => regenerateQR(item)}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                >
                                    Регенерировать
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модальное окно для отображения QR-кода */}
            {showQRModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>QR-код</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowQRModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="qr-code-container">
                                <QRCodeSVG
                                    id={`qr-canvas-${selectedItem.id}`}
                                    value={selectedItem.text}
                                    size={300}
                                    level="M"
                                    includeMargin={true}
                                />
                            </div>
                            
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <p><strong>Содержимое:</strong></p>
                                <p style={{ wordBreak: 'break-all', color: '#666' }}>
                                    {selectedItem.text}
                                </p>
                                <p style={{ fontSize: '0.9rem', color: '#999' }}>
                                    Создано: {selectedItem.timestamp}
                                </p>
                            </div>
                            
                            <div className="button-group" style={{ marginTop: '1rem' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => downloadQR(selectedItem)}
                                >
                                    Скачать QR-код
                                </button>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => copyToClipboard(selectedItem.text)}
                                >
                                    Копировать текст
                                </button>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowQRModal(false)}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { GenerationHistory };
