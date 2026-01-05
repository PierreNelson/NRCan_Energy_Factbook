import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getText } from '../utils/translations';
import page1Image from '../assets/page1_bg.jpg';

const Page1 = () => {
    const { lang } = useOutletContext();

    // Prefetch data and code in the background while user views this page
    useEffect(() => {
        // Prefetch next pages in Section 1 when they are added
        // For now, just prefetch Section 2 intro
        import('./Page23');
    }, []);

    // Build screen reader text for the title
    const getTitleText = () => {
        return `${getText('page1_section', lang)} ${getText('page1_title', lang)}`;
    };

    // Build screen reader text for the list items
    const getListItemsText = () => {
        const items = [1, 2, 3].map(num => getText(`page1_item${num}`, lang));
        const prefix = lang === 'en' ? 'This section covers:' : 'Cette section couvre:';
        return `${prefix} ${items.join('. ')}.`;
    };

    return (
        <main 
            id="main-content"
            tabIndex="-1"
            className="page-content page-1 page1-main" 
            role="main"
            aria-label={getTitleText()}
            style={{
                backgroundColor: '#5a7a8a',
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <style>{`
                /* Base Styles (100% Zoom) */
.page1-main {
    overflow: visible;
}

.page1-container {
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.page1-image-title-wrapper {
    position: relative;
    width: 100%;
    /* Base height for 100% zoom */
    min-height: 500px; 
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.page1-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.page1-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 65%;
}

.page1-title {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 0;
    background-color: transparent;
    box-sizing: border-box;
}

.page1-title-box {
    background-color: rgba(255, 255, 255, 0.7); 
    padding: 20px 40px;
    width: 100%;
    box-sizing: border-box;
}

.page1-list {
    width: 100%;
    background-color: #5a7a8a;
    padding: 30px 40px;
    box-sizing: border-box;
    flex: 1;
}

/* Initial large font sizes */
.page1-title-text {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 4.5rem; 
    color: #221e1f;
    display: block;
    line-height: 1.15;
    text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5);
}

.page1-list-item {
    margin-bottom: 8px;
    font-size: 2.2rem; 
}

/* --- ZOOM LEVEL MEDIA QUERIES --- */

/* 110% Zoom (~1745px) */
@media (max-width: 1745px) {
    .page1-image-title-wrapper {
        min-height: 480px; /* Slightly reduced height */
    }
    .page1-title-text {
        font-size: 4.2rem;
    }
    .page1-list-item {
        font-size: 2.1rem;
    }
}

/* 125% Zoom (~1536px) */
@media (max-width: 1536px) {
    .page1-image-title-wrapper {
        min-height: 450px;
    }
    .page1-title-text {
        font-size: 4.0rem;
    }
    .page1-list-item {
        font-size: 2.0rem; /* Kept large */
    }
}

/* 150% Zoom (~1280px) */
@media (max-width: 1280px) {
    .page1-image-title-wrapper {
        min-height: 420px;
    }
    .page1-title-text {
        font-size: 3.8rem;
    }
    .page1-list-item {
        font-size: 1.9rem;
    }
}

/* 175% Zoom (~1100px) */
@media (max-width: 1100px) {
    .page1-image-title-wrapper {
        min-height: 380px;
    }
    .page1-title-text {
        font-size: 3.5rem;
    }
    .page1-list-item {
        font-size: 1.8rem;
    }
}

/* 200% Zoom (~960px) */
@media (max-width: 960px) {
    .page1-image-title-wrapper {
        min-height: 350px; /* Significantly reduced to fit viewport */
    }
    .page1-title-text {
        font-size: 3.2rem;
    }
    .page1-list-item {
        font-size: 1.7rem;
    }
    .page1-title-box, .page1-list {
        padding: 20px 30px;
    }
}

/* 300% Zoom (~640px) */
@media (max-width: 640px) {
    .page1-image-title-wrapper {
        min-height: 300px;
    }
    .page1-title-text {
        font-size: 2.5rem; /* adjusted to fit width */
    }
    .page1-list-item {
        font-size: 1.5rem;
    }
    .page1-title-box, .page1-list {
        padding: 15px 20px;
    }
}

/* 400% Zoom (~480px) */
@media (max-width: 480px) {
    .page1-image-title-wrapper {
        min-height: 250px; /* Short enough to leave room for text */
    }
    .page1-title-text {
        font-size: 2.0rem; 
    }
    .page1-list-item {
        font-size: 1.3rem; /* robust accessible size */
    }
}

/* 500% Zoom (~384px) */
@media (max-width: 384px) {
    .page1-image-title-wrapper {
        min-height: 220px;
    }
    .page1-title-text {
        font-size: 1.8rem;
    }
    .page1-list-item {
        font-size: 1.2rem;
    }
    /* Ensure no extra margin creates whitespace */
    .page1-container {
        min-height: 100vh; 
    }
}
            `}</style>

            <div className="page1-container">
                {/* Image and Title Wrapper */}
                <div className="page1-image-title-wrapper">
                    {/* Background Image */}
                    <div className="page1-image" aria-hidden="true">
                        <img
                            src={page1Image}
                            alt=""
                        />
                    </div>

                    {/* REGION 1: Title */}
                    <header 
                        className="page1-title"
                        role="region"
                        aria-label={getTitleText()}
                    >
                        <div className="page1-title-box">
                            <h1 aria-hidden="true" style={{ margin: 0 }}>
                                <span className="page1-title-text" style={{ fontWeight: 'normal' }}>
                                    {getText('page1_section', lang)}
                                </span>
                                <span className="page1-title-text" style={{ fontWeight: 'bold', lineHeight: '1.1' }}>
                                    {getText('page1_title', lang)}
                                </span>
                            </h1>
                        </div>
                    </header>
                </div>

                {/* REGION 2: Section Contents */}
                <nav 
                    className="page1-list"
                    role="region"
                    aria-label={getListItemsText()}
                >
                    <ul aria-hidden="true" style={{
                        listStyleType: 'none',
                        padding: '0',
                        margin: '0',
                        color: '#ebe8e1',
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        {[1, 2, 3].map(num => (
                            <li key={num} className="page1-list-item">
                                {getText(`page1_item${num}`, lang)}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </main>
    );
};

export default Page1;

