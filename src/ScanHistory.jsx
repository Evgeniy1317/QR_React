import React, { useState, useEffect } from 'react';

const ScanHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, URL, Email, Телефон, WiFi, Текст

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            const savedHistory = JSON.parse(localStorage.getItem('qrScanHistory') || '[]');
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
        localStorage.setItem('qrScanHistory', JSON.stringify(updatedHistory));
    };

    const clearAllHistory = () => {
        if (window.confirm('Вы уверены, что хотите удалить всю историю сканирования?')) {
            setHistory([]);
            localStorage.removeItem('qrScanHistory');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Данные скопированы в буфер обмена!');
        }).catch(() => {
            alert('Не удалось скопировать данные');
        });
    };

    const openLink = (url) => {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'URL':
                return '🌐';
            case 'Email':
                return '📧';
            case 'Телефон':
                return '📞';
            case 'WiFi':
                return '📶';
            default:
                return '📝';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'URL':
                return '#007bff';
            case 'Email':
                return '#28a745';
            case 'Телефон':
                return '#ffc107';
            case 'WiFi':
                return '#6f42c1';
            default:
                return '#6c757d';
        }
    };

    const filteredHistory = filter === 'all' 
        ? history 
        : history.filter(item => item.type === filter);

    const typeCounts = history.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="content-container">
                <h2>История сканирования</h2>
                <div className="empty-state">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>История сканирования</h2>
                {history.length > 0 && (
                    <button className="btn btn-danger" onClick={clearAllHistory}>
                        Очистить всю историю
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="empty-state">
                    <h3>История пуста</h3>
                    <p>Здесь будут отображаться все отсканированные QR-коды</p>
                    <p>Перейдите в раздел "Сканировать QR код" для сканирования первого QR-кода</p>
                </div>
            ) : (
                <>
                    {/* Статистика */}
                    <div className="stats-container" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
                        <h4>Статистика сканирования:</h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {Object.entries(typeCounts).map(([type, count]) => (
                                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span>{getTypeIcon(type)}</span>
                                    <span>{type}: {count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Фильтры */}
                    <div className="filter-container" style={{ marginBottom: '1rem' }}>
                        <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Фильтр по типу:</label>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
                        >
                            <option value="all">Все типы ({history.length})</option>
                            {Object.entries(typeCounts).map(([type, count]) => (
                                <option key={type} value={type}>
                                    {getTypeIcon(type)} {type} ({count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="history-list">
                        <p style={{ marginBottom: '1rem', color: '#666' }}>
                            Показано записей: {filteredHistory.length} из {history.length}
                        </p>
                        
                        {filteredHistory.map((item, index) => (
                            <div key={item.id} className="history-item">
                                <div className="history-item-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{getTypeIcon(item.type)}</span>
                                        <strong>#{index + 1} - {item.type}</strong>
                                        <span 
                                            style={{ 
                                                background: getTypeColor(item.type), 
                                                color: 'white', 
                                                padding: '0.2rem 0.5rem', 
                                                borderRadius: '15px', 
                                                fontSize: '0.7rem' 
                                            }}
                                        >
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="item-actions">
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
                                    <strong>Данные:</strong> {item.data}
                                </div>
                                
                                <div className="history-item-date">
                                    Отсканировано: {item.timestamp}
                                </div>
                                
                                <div className="item-actions" style={{ marginTop: '0.5rem' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => copyToClipboard(item.data)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                    >
                                        Копировать
                                    </button>
                                    
                                    {item.type === 'URL' && item.data.startsWith('http') && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => openLink(item.data)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        >
                                            Открыть ссылку
                                        </button>
                                    )}
                                    
                                    {item.type === 'Email' && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => window.open(`mailto:${item.data.replace('mailto:', '')}`)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        >
                                            Открыть email
                                        </button>
                                    )}
                                    
                                    {item.type === 'Телефон' && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => window.open(`tel:${item.data.replace('tel:', '')}`)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        >
                                            Позвонить
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export { ScanHistory };
