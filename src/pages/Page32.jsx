import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { getForeignControlData, getInternationalInvestmentData } from '../utils/dataLoader';
import { getText } from '../utils/translations';

const Page32 = () => {
    const { lang } = useOutletContext();
    const [chartData, setChartData] = useState([]);
    const [investmentData, setInvestmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [isTableOpen, setIsTableOpen] = useState(false);

    // Track window width for responsive chart settings
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load data on mount
    useEffect(() => {
        Promise.all([
            getForeignControlData(),
            getInternationalInvestmentData()
        ])
            .then(([foreignData, intlData]) => {
                setChartData(foreignData);
                setInvestmentData(intlData);
            })
            .catch(err => {
                console.error("Failed to load page 32 data:", err);
                setError(err.message || 'Failed to load data');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Colors matching the NRCan Factbook chart
    const COLORS = {
        'utilities': '#284162',      // Dark blue
        'oil_gas': '#419563',        // Green
        'all_non_financial': '#8B7355', // Olive/brown
    };

    // Calculate bullet point values from investment data
    const bulletValues = useMemo(() => {
        if (investmentData.length < 2) return null;
        
        const latestYear = investmentData[investmentData.length - 1];
        const prevYear = investmentData[investmentData.length - 2];
        
        const fdiLatest = (latestYear.fdi || 0) / 1000; // Convert to billions
        const fdiPrev = (prevYear.fdi || 0) / 1000;
        const cdiaLatest = (latestYear.cdia || 0) / 1000;
        const cdiaPrev = (prevYear.cdia || 0) / 1000;
        
        const fdiGrowth = fdiPrev > 0 ? ((fdiLatest - fdiPrev) / fdiPrev * 100) : 0;
        const cdiaGrowth = cdiaPrev > 0 ? ((cdiaLatest - cdiaPrev) / cdiaPrev * 100) : 0;
        
        // Energy industry share of overall FDI - approximately 10%
        const energyShare = 10;
        
        // Oil and gas extraction as portion of CDIA - approximately $36B
        // This is roughly 17% of total CDIA based on the factbook
        const oilGasCdia = Math.round(cdiaLatest * 0.168);
        
        return {
            year: latestYear.year,
            prevYear: prevYear.year,
            fdi: Math.round(fdiLatest),
            fdiGrowth: fdiGrowth.toFixed(1),
            energyShare,
            cdia: Math.round(cdiaLatest),
            cdiaGrowth: Math.round(cdiaGrowth),
            oilGasCdia
        };
    }, [investmentData]);

    // Process chart data
    const processedChartData = useMemo(() => {
        if (chartData.length === 0) return null;

        const years = chartData.map(d => d.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        // Generate tick values: start at 2010, every 2 years up to maxYear
        const tickVals = [];
        for (let y = 2010; y <= maxYear; y += 2) {
            tickVals.push(y);
        }

        const utilitiesValues = chartData.map(d => d.utilities || 0);
        const oilGasValues = chartData.map(d => d.oil_gas || 0);
        const allIndustriesValues = chartData.map(d => d.all_non_financial || 0);

        // Build hover text
        const buildHoverText = (values, labelKey) => values.map((v, i) => {
            return `${getText(labelKey, lang)}<br>${years[i]}: ${v.toFixed(1)}%`;
        });

        // Order: All non-financial, Oil/gas, Utilities (left to right in chart)
        const traces = [
            {
                name: getText('page32_legend_all_industries', lang),
                x: years,
                y: allIndustriesValues,
                type: 'bar',
                marker: { color: COLORS.all_non_financial },
                hovertext: buildHoverText(allIndustriesValues, 'page32_hover_all_industries'),
                hoverinfo: 'text',
                hoverlabel: {
                    bgcolor: '#ffffff',
                    bordercolor: '#000000',
                    font: { color: '#000000', size: windowWidth <= 480 ? 12 : 14, family: 'Arial, sans-serif' }
                },
            },
            {
                name: getText('page32_legend_oil_gas', lang),
                x: years,
                y: oilGasValues,
                type: 'bar',
                marker: { color: COLORS.oil_gas },
                hovertext: buildHoverText(oilGasValues, 'page32_hover_oil_gas'),
                hoverinfo: 'text',
                hoverlabel: {
                    bgcolor: '#ffffff',
                    bordercolor: '#000000',
                    font: { color: '#000000', size: windowWidth <= 480 ? 12 : 14, family: 'Arial, sans-serif' }
                },
            },
            {
                name: getText('page32_legend_utilities', lang),
                x: years,
                y: utilitiesValues,
                type: 'bar',
                marker: { color: COLORS.utilities },
                hovertext: buildHoverText(utilitiesValues, 'page32_hover_utilities'),
                hoverinfo: 'text',
                hoverlabel: {
                    bgcolor: '#ffffff',
                    bordercolor: '#000000',
                    font: { color: '#000000', size: windowWidth <= 480 ? 12 : 14, family: 'Arial, sans-serif' }
                },
            }
        ];

        return { traces, years, tickVals, minYear, maxYear, utilitiesValues, oilGasValues, allIndustriesValues };
    }, [chartData, lang, windowWidth]);

    // Format value for screen readers
    const formatPercentSR = (val) => {
        return lang === 'en' 
            ? `${val.toFixed(1)} percent` 
            : `${val.toFixed(1)} pour cent`;
    };

    // Screen reader version of chart title
    const getChartTitleSR = () => {
        if (lang === 'en') {
            return 'Foreign control of Canadian assets';
        } else {
            return "Contrôle étranger d'actifs canadiens";
        }
    };

    // Screen reader summary
    const getChartDataSummary = () => {
        if (!chartData || chartData.length === 0) return '';
        
        const latestYear = chartData[chartData.length - 1];
        const latestYearNum = latestYear.year;

        if (lang === 'en') {
            return `Grouped bar chart showing foreign control of Canadian assets from ${processedChartData?.minYear} to ${latestYearNum}. In ${latestYearNum}, Utilities were at ${formatPercentSR(latestYear.utilities || 0)}, Oil and gas extraction at ${formatPercentSR(latestYear.oil_gas || 0)}, and All non-financial industries at ${formatPercentSR(latestYear.all_non_financial || 0)}. Expand the data table below for detailed values.`;
        } else {
            return `Graphique à barres groupées montrant le contrôle étranger des actifs canadiens de ${processedChartData?.minYear} à ${latestYearNum}. En ${latestYearNum}, les Services publics étaient à ${formatPercentSR(latestYear.utilities || 0)}, l'Extraction de pétrole et de gaz à ${formatPercentSR(latestYear.oil_gas || 0)}, et le Total des industries non financières à ${formatPercentSR(latestYear.all_non_financial || 0)}. Développez le tableau de données ci-dessous pour les valeurs détaillées.`;
        }
    };

    // Format number for table display
    const formatNumber = (val) => {
        return val.toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA', { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
        });
    };

    // Generate accessible data table
    const getAccessibleDataTable = () => {
        if (!chartData || chartData.length === 0) return null;
        
        const unitText = lang === 'en' ? ', in percent' : ', en pourcentage';
        const captionId = 'page32-table-caption';
        
        return (
            <details 
                onToggle={(e) => setIsTableOpen(e.currentTarget.open)}
                style={{ 
                    marginTop: '10px', 
                    marginBottom: '10px', 
                    width: '95%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    fontFamily: 'Arial, sans-serif'
                }}
            >
                <summary 
                    role="button"
                    aria-expanded={isTableOpen}
                    style={{ 
                        cursor: 'pointer', 
                        color: '#333', 
                        fontWeight: 'bold', 
                        padding: '10px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        listStyle: 'none'
                    }}
                >
                    <span aria-hidden="true" style={{ marginRight: '8px' }}>{isTableOpen ? '▼' : '▶'}</span>
                    {lang === 'en' ? 'View Data Table' : 'Voir le tableau de données'}
                    <span className="sr-only">{lang === 'en' ? ' (press Enter to open or close)' : ' (appuyez sur Entrée pour ouvrir ou fermer)'}</span>
                </summary>

                <div 
                    role="region"
                    aria-labelledby={captionId}
                    tabIndex="0"
                    style={{ 
                        overflowX: 'auto',
                        overflowY: 'visible',
                        border: '1px solid #ccc', 
                        borderTop: 'none',
                        padding: '10px',
                        maxHeight: 'none'
                    }}
                >
                    <table style={{ 
                        width: '100%', 
                        minWidth: windowWidth <= 480 ? '100%' : '500px', 
                        borderCollapse: 'collapse', 
                        textAlign: 'left', 
                        fontSize: '14px' 
                    }}>
                        <caption 
                            id={captionId}
                            style={{ 
                                textAlign: 'left', 
                                padding: '8px', 
                                fontWeight: 'bold',
                                backgroundColor: '#f0f0f0',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word'
                            }}
                        >
                            {lang === 'en' 
                                ? 'Foreign control of Canadian assets (percentage of total assets)'
                                : "Contrôle étranger d'actifs canadiens (pourcentage des actifs totaux)"}
                        </caption>
                        <thead>
                            <tr style={{ backgroundColor: '#eee' }}>
                                <th scope="col" style={{ 
                                    padding: '8px', 
                                    borderBottom: '2px solid #ddd',
                                    position: 'sticky',
                                    left: 0,
                                    backgroundColor: '#eee',
                                    zIndex: 2
                                }}>
                                    {lang === 'en' ? 'Year' : 'Année'}
                                </th>
                                <th scope="col" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>
                                    {getText('page32_legend_utilities', lang)}
                                </th>
                                <th scope="col" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>
                                    {getText('page32_legend_oil_gas', lang)}
                                </th>
                                <th scope="col" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>
                                    {getText('page32_legend_all_industries', lang)}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map(yearData => (
                                <tr key={yearData.year} style={{ borderBottom: '1px solid #eee' }}>
                                    <th scope="row" style={{ 
                                        padding: '8px', 
                                        fontWeight: 'normal',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: '#f9f9f9',
                                        zIndex: 1
                                    }}>
                                        {yearData.year}
                                    </th>
                                    <td style={{ padding: '8px' }}>{formatNumber(yearData.utilities || 0)}%</td>
                                    <td style={{ padding: '8px' }}>{formatNumber(yearData.oil_gas || 0)}%</td>
                                    <td style={{ padding: '8px' }}>{formatNumber(yearData.all_non_financial || 0)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        );
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>Error: {error}. Please refresh the page.</div>;
    }

    if (!processedChartData) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>No data available. Please refresh the page.</div>;
    }

    return (
        <main 
            id="main-content"
            tabIndex="-1"
            className="page-content page-32" 
            role="main"
            aria-label={getText('page32_title', lang)}
            style={{
                backgroundColor: 'white',
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderLeft: '18px solid #8e7e52',
                boxSizing: 'border-box',
            }}
        >
            <style>{`
                /* BASE: 100% zoom (>1745px) */
                .page32-container {
                    width: 100%;
                    padding: 15px 30px 20px 30px;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    flex: 1;
                    overflow: visible;
                }

                .page32-title {
                    font-family: 'Georgia', serif;
                    color: #857550;
                    font-size: 2.2rem;
                    font-weight: bold;
                    font-style: italic;
                    margin-bottom: 0px;
                    margin-top: 5px;
                    line-height: 1.3;
                }

                .page32-bullets {
                    font-family: Arial, sans-serif;
                    color: #333;
                    font-size: 1rem;
                    margin-bottom: 10px;
                    line-height: 1.6;
                    padding-left: 20px;
                    list-style-type: disc;
                }

                .page32-bullets li {
                    margin-bottom: 8px;
                }

                .page32-bullets li::marker {
                    font-size: 1rem; 
                }

                .visual-bold {
                    font-weight: bold;
                }

                .page32-section-title {
                    font-family: Arial, sans-serif;
                    color: #333;
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 0px;
                    margin-top: 15px;
                }

                .page32-section-text {
                    font-family: Arial, sans-serif;
                    color: #333;
                    font-size: 1rem;
                    margin-bottom: 0px;
                    line-height: 1.5;
                    position: relative; /* Ensure absolute positioning works inside if needed */
                }

                .page32-chart-title {
                    font-family: Arial, sans-serif;
                    color: #333;
                    font-size: 1.2rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 5px;
                }

                .page32-chart-wrapper {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    justify-content: flex-start;
                    gap: 20px;
                    width: 100%;
                }

                .page32-chart {
                    flex: 1;
                    min-width: 0;
                    width: 100%;
                    height: calc(100vh - 680px);
                    min-height: 260px;
                }

                /* 110% zoom (~1745px) */
                @media (max-width: 1745px) {
                    .page32-chart {
                        height: calc(100vh - 660px);
                        min-height: 264px;
                    }
                }

                /* 125% zoom (~1536px) */
                @media (max-width: 1536px) {
                    .page32-container {
                        padding: 10px 25px 10px 25px;
                    }
                    .page32-title {
                        font-size: 1.8rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 640px);
                        min-height: 268px;
                    }
                }

                /* 150% zoom (~1280px) */
                @media (max-width: 1280px) {
                    .page32-container {
                        padding: 10px 20px 10px 20px;
                    }
                    .page32-title {
                        font-size: 1.6rem;
                    }
                    
                    .page32-chart {
                        flex: 0 0 auto;
                        height: calc(100vh - 620px);
                        min-height: 272px;
                        width: 100%;
                    }
                }

                /* 175% zoom (~1097px) */
                @media (max-width: 1097px) {
                    .page32-title {
                        font-size: 1.5rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 600px);
                        min-height: 276px;
                    }
                }

                /* 200% zoom (~960px) */
                @media (max-width: 960px) {
                    .page32-container {
                        padding: 8px 15px 8px 15px;
                    }
                    .page32-title {
                        font-size: 1.4rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 580px);
                        min-height: 280px;
                    }
                }

                /* 250% zoom (~768px) */
                @media (max-width: 768px) {
                    .page-32 {
                        border-left: none !important;
                    }
                    .page32-container {
                        padding: 8px 15px;
                    }
                    .page32-title {
                        font-size: 1.3rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 550px);
                        min-height: 285px;
                    }
                }
                
                /* 300% zoom (~640px) */
                @media (max-width: 640px) {
                    .page32-title {
                        font-size: 1.2rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 520px);
                        min-height: 290px;
                    }
                }

                /* 400% zoom (~480px) */
                @media (max-width: 480px) {
                    .page32-container {
                        padding: 5px 10px;
                    }
                    .page32-title {
                        font-size: 1.1rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 500px);
                        min-height: 295px;
                    }
                }

                /* 500% zoom (~384px) */
                @media (max-width: 384px) {
                    .page32-container {
                        padding: 5px 8px;
                    }
                    .page32-title {
                        font-size: 1rem;
                    }
                    .page32-chart {
                        height: calc(100vh - 480px);
                        min-height: 300px;
                    }
                }
                
                /* Hide default disclosure triangle */
                details summary::-webkit-details-marker,
                details summary::marker {
                    display: none;
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `}</style>

            <div className="page32-container">
                {/* Title */}
                <h1 className="page32-title">
                    {getText('page32_title', lang)}
                </h1>

                {/* Bullet Points with Dynamic Values */}
                {bulletValues && (
                    <ul className="page32-bullets" role="list">
                        {/* Bullet 1 - FIXED: Removed trailing period from aria-label to stop "Dot" reading */}
                        <li role="listitem" aria-label={lang === 'en' 
                            ? `${getText('page32_bullet1_part1', lang)}${getText('page32_bullet1_part2', lang)}${getText('page32_bullet1_part3', lang)}${bulletValues.year}${getText('page32_bullet1_part4', lang)}${bulletValues.fdi}${getText('page32_bullet1_part5', lang)} (+${bulletValues.fdiGrowth}% over the previous year)`
                            : `${getText('page32_bullet1_part1', lang)}${getText('page32_bullet1_part2', lang)}${getText('page32_bullet1_part3', lang)}${bulletValues.fdi}${getText('page32_bullet1_part4', lang)}${getText('page32_bullet1_part5', lang)}${bulletValues.year} (+${bulletValues.fdiGrowth}% par rapport à l'année précédente)`
                        }>
                            <span aria-hidden="true">
                                {lang === 'en' ? (
                                    <>
                                        {getText('page32_bullet1_part1', lang)}
                                        <span className="visual-bold">{getText('page32_bullet1_part2', lang)}</span>
                                        {getText('page32_bullet1_part3', lang)}
                                        {bulletValues.year}
                                        {getText('page32_bullet1_part4', lang)}
                                        <span className="visual-bold">${bulletValues.fdi}{getText('page32_bullet1_part5', lang)}</span>
                                        {' (+'}
                                        {bulletValues.fdiGrowth}
                                        {'% over the previous year).'}
                                    </>
                                ) : (
                                    <>
                                        {getText('page32_bullet1_part1', lang)}
                                        <span className="visual-bold">{getText('page32_bullet1_part2', lang)}</span>
                                        {getText('page32_bullet1_part3', lang)}
                                        <span className="visual-bold">{bulletValues.fdi}{getText('page32_bullet1_part4', lang)}</span>
                                        {getText('page32_bullet1_part5', lang)}
                                        {bulletValues.year}
                                        {' (+'}
                                        {bulletValues.fdiGrowth}
                                        {"% par rapport à l'année précédente)."}
                                    </>
                                )}
                            </span>
                        </li>

                        {/* Bullet 2 */}
                        <li role="listitem" aria-label={`${getText('page32_bullet2_part1', lang)} ${bulletValues.energyShare}${getText('page32_bullet2_part2', lang)}${bulletValues.year}${getText('page32_bullet2_part3', lang)}${bulletValues.prevYear}${getText('page32_bullet2_part4', lang)}`}>
                            <span aria-hidden="true">
                                {getText('page32_bullet2_part1', lang)}
                                <span className="visual-bold">{bulletValues.energyShare}</span>
                                {getText('page32_bullet2_part2', lang)}
                                {bulletValues.year}
                                {getText('page32_bullet2_part3', lang)}
                                {bulletValues.prevYear}
                                {getText('page32_bullet2_part4', lang)}
                            </span>
                        </li>

                        {/* Bullet 3 */}
                        <li role="listitem" aria-label={lang === 'en'
                            ? `${getText('page32_bullet3_part1', lang)}${getText('page32_bullet3_part2', lang)}${getText('page32_bullet3_part3', lang)}${bulletValues.cdia}${getText('page32_bullet3_part4', lang)}${getText('page32_bullet3_part5', lang)}${bulletValues.year}${getText('page32_bullet3_part6', lang)}${bulletValues.cdiaGrowth}${getText('page32_bullet3_part7', lang)}${bulletValues.prevYear}${getText('page32_bullet3_part8', lang)}`
                            : `${getText('page32_bullet3_part1', lang)}${getText('page32_bullet3_part2', lang)}${getText('page32_bullet3_part3', lang)}${bulletValues.cdia}${getText('page32_bullet3_part4', lang)}${getText('page32_bullet3_part5', lang)}${bulletValues.year}${getText('page32_bullet3_part6', lang)}${bulletValues.cdiaGrowth}${getText('page32_bullet3_part7', lang)}${bulletValues.prevYear}${getText('page32_bullet3_part8', lang)}`
                        }>
                            <span aria-hidden="true">
                                {getText('page32_bullet3_part1', lang)}
                                <span className="visual-bold">{getText('page32_bullet3_part2', lang)}</span>
                                {getText('page32_bullet3_part3', lang)}
                                <span className="visual-bold">${bulletValues.cdia}{getText('page32_bullet3_part4', lang)}</span>
                                {getText('page32_bullet3_part5', lang)}
                                {bulletValues.year}
                                {getText('page32_bullet3_part6', lang)}
                                {bulletValues.cdiaGrowth}
                                {getText('page32_bullet3_part7', lang)}
                                {bulletValues.prevYear}
                                {getText('page32_bullet3_part8', lang)}
                            </span>
                        </li>

                        {/* Bullet 4 */}
                        <li role="listitem" aria-label={lang === 'en'
                            ? `${getText('page32_bullet4_part1', lang)}${bulletValues.oilGasCdia}${getText('page32_bullet4_part2', lang)}${getText('page32_bullet4_part3', lang)}${bulletValues.year}${getText('page32_bullet4_part4', lang)}`
                            : `${getText('page32_bullet4_part1', lang)}${bulletValues.oilGasCdia}${getText('page32_bullet4_part2', lang)}${getText('page32_bullet4_part3', lang)}${bulletValues.year}${getText('page32_bullet4_part4', lang)}`
                        }>
                            <span aria-hidden="true">
                                {getText('page32_bullet4_part1', lang)}
                                <span className="visual-bold">${bulletValues.oilGasCdia}{getText('page32_bullet4_part2', lang)}</span>
                                {getText('page32_bullet4_part3', lang)}
                                {bulletValues.year}
                                {getText('page32_bullet4_part4', lang)}
                            </span>
                        </li>
                    </ul>
                )}

                {/* Section Title */}
                <h2 className="page32-section-title">
                    {getText('page32_section_title', lang)}
                </h2>

                {/* Section Text - FIXED: Use SR-only span to ensure reading */}
                <p className="page32-section-text">
                    {/* 1. Screen Reader sees this simple block */}
                    <span className="sr-only">
                        {getText('page32_section_text', lang)}
                    </span>
                    
                    {/* 2. Sighted user sees this HTML with bolding, hidden from SR */}
                    <span 
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{
                            __html: getText('page32_section_text', lang).replace(
                                getText('page32_section_bold_text', lang),
                                `<span class="visual-bold">${getText('page32_section_bold_text', lang)}</span>`
                            )
                        }}
                    />
                </p>

                {/* Chart Section */}
                <div>
                    <h3 
                        className="page32-chart-title" 
                        aria-label={getChartTitleSR()} 
                    >
                        {getText('page32_chart_title', lang)}
                    </h3>

                    {/* Chart overview for screen readers */}
                    <div role="region" aria-label={getChartDataSummary()}>
                        {/* Accessible data table */}
                        {getAccessibleDataTable()}
                        
                        <div className="page32-chart-wrapper">
                            <figure aria-hidden="true" className="page32-chart" style={{ margin: 0 }}>
                                <Plot
                                    data={processedChartData.traces}
                                    layout={{
                                        barmode: 'group',
                                        hovermode: 'closest',
                                        showlegend: true,
                                        legend: {
                                            orientation: windowWidth <= 1280 ? 'h' : 'v',
                                            x: windowWidth <= 1280 ? 0.5 : 1.02,
                                            xanchor: windowWidth <= 1280 ? 'center' : 'left',
                                            y: windowWidth <= 1280 ? -0.25 : 0.1,
                                            yanchor: windowWidth <= 1280 ? 'top' : 'middle',
                                            font: { size: windowWidth <= 480 ? 13 : 16, family: 'Arial, sans-serif' },
                                            itemclick: 'toggle',
                                            itemdoubleclick: 'toggleothers'
                                        },
                                        xaxis: {
                                            tickvals: processedChartData.tickVals,
                                            showgrid: false,
                                            zeroline: false,
                                            range: [processedChartData.minYear - 0.5, processedChartData.maxYear + 0.5],
                                            tickangle: windowWidth <= 640 ? -45 : 0,
                                            tickfont: { size: windowWidth <= 480 ? 11 : 12, family: 'Arial, sans-serif' },
                                            automargin: true,
                                        },
                                        yaxis: {
                                            title: { 
                                                text: getText('page32_yaxis', lang), 
                                                font: { size: windowWidth <= 768 ? 14 : windowWidth <= 960 ? 16 : 18, family: 'Arial, sans-serif', color: '#333'},
                                                standoff: 5
                                            },
                                            range: [0, 55],
                                            dtick: 10,
                                            tickformat: '.0f',
                                            ticksuffix: '%',
                                            showgrid: false,
                                            showline: true,
                                            linewidth: 1,
                                            linecolor: '#333',
                                            automargin: true,
                                            tickfont: { size: windowWidth <= 480 ? 11 : 12, family: 'Arial, sans-serif' }
                                        },
                                        margin: { 
                                            l: windowWidth <= 480 ? 50 : windowWidth <= 768 ? 60 : 70, 
                                            r: windowWidth <= 1280 ? 15 : 180,
                                            t: 20, 
                                            b: windowWidth <= 1280 ? 80 : 50
                                        },
                                        autosize: true,
                                        bargap: 0.15,
                                        bargroupgap: 0.1
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    useResizeHandler={true}
                                    config={{ displayModeBar: false, responsive: true }}
                                />
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Page32;

