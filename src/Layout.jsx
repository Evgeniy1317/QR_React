import React, { useState } from 'react';
import { QrCodeGenerator } from './QrCodeGenerator';
import { QrCodeScanner } from './QrCodeScanner';
import { GenerationHistory } from './GenerationHistory';
import { ScanHistory } from './ScanHistory';
import './App.css';

const Layout = () => {
    const [activeTab, setActiveTab] = useState('generate');

    const tabs = [
        { id: 'generate', label: 'Генерировать QR код' },
        { id: 'scan', label: 'Сканировать QR код' },
        { id: 'generation-history', label: 'История генерирования' },
        { id: 'scan-history', label: 'История сканирования' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'generate':
                return <QrCodeGenerator />;
            case 'scan':
                return <QrCodeScanner />;
            case 'generation-history':
                return <GenerationHistory />;
            case 'scan-history':
                return <ScanHistory />;
            default:
                return <QrCodeGenerator />;
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>QR Code Manager</h1>
                <nav className="navigation">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="app-main">
                {renderContent()}
            </main>
        </div>
    );
};

export { Layout };