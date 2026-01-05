
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getText } from '../utils/translations';

const Sidebar = ({ lang }) => {
    // Start collapsed - user must expand to see contents
    const [section1Expanded, setSection1Expanded] = useState(false);
    const [section2Expanded, setSection2Expanded] = useState(false);

    const toggleSection1 = () => {
        setSection1Expanded(!section1Expanded);
    };

    const toggleSection2 = () => {
        setSection2Expanded(!section2Expanded);
    };

    // Handle keyboard navigation - Space or Enter to toggle
    const handleKeyDown1 = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggleSection1();
        }
    };

    const handleKeyDown2 = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggleSection2();
        }
    };

    return (
        <div className="sidebar" role="navigation" aria-label={lang === 'en' ? 'Main Navigation' : 'Navigation principale'}>
            <div className="sidebar-header">
                <span id="sidebar-title">{getText('table_of_contents', lang)}</span>
            </div>

            <div id="nav-links-container" className="nav-links">
                {/* Section 1 */}
                <div className="nav-section">
                    <button
                        className="nav-section-header"
                        onClick={toggleSection1}
                        onKeyDown={handleKeyDown1}
                        aria-expanded={section1Expanded}
                        aria-controls="section1-content"
                        aria-label={`${getText('nav_section1', lang)}. ${section1Expanded 
                            ? (lang === 'en' ? 'Expanded. Press Space to collapse.' : 'Développé. Appuyez sur Espace pour réduire.')
                            : (lang === 'en' ? 'Collapsed. Press Space to expand.' : 'Réduit. Appuyez sur Espace pour développer.')
                        }`}
                    >
                        <span className="section-arrow" aria-hidden="true">
                            {section1Expanded ? "▼" : "▶"}
                        </span>
                        <span>{getText('nav_section1', lang)}</span>
                    </button>

                    {/* Only render content when expanded - completely hidden from screen readers when collapsed */}
                    {section1Expanded && (
                        <div 
                            id="section1-content"
                            className="nav-section-content expanded"
                            role="group"
                            aria-label={getText('nav_section1', lang)}
                        >
                            {/* Section 1 Intro (Page 1) */}
                            <NavLink
                                to="/"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_section1_title', lang)}
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Section 2 */}
                <div className="nav-section">
                    <button
                        className="nav-section-header"
                        onClick={toggleSection2}
                        onKeyDown={handleKeyDown2}
                        aria-expanded={section2Expanded}
                        aria-controls="section2-content"
                        aria-label={`${getText('nav_section2', lang)}. ${section2Expanded 
                            ? (lang === 'en' ? 'Expanded. Press Space to collapse.' : 'Développé. Appuyez sur Espace pour réduire.')
                            : (lang === 'en' ? 'Collapsed. Press Space to expand.' : 'Réduit. Appuyez sur Espace pour développer.')
                        }`}
                    >
                        <span className="section-arrow" aria-hidden="true">
                            {section2Expanded ? "▼" : "▶"}
                        </span>
                        <span>{getText('nav_section2', lang)}</span>
                    </button>

                    {/* Only render content when expanded - completely hidden from screen readers when collapsed */}
                    {section2Expanded && (
                        <div 
                            id="section2-content"
                            className="nav-section-content expanded"
                            role="group"
                            aria-label={getText('nav_section2', lang)}
                        >
                            {/* Investment (Section 2 Intro - Page 23) */}
                            <NavLink
                                to="/page-23"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_section2_title', lang)}
                            </NavLink>

                            {/* Page 24 */}
                            <NavLink
                                to="/page-24"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_capital_expenditure', lang)}
                            </NavLink>

                            {/* Page 25 */}
                            <NavLink
                                to="/page-25"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_infrastructure', lang)}
                            </NavLink>

                            {/* Page 26 */}
                            <NavLink
                                to="/page-26"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_economic_contributions', lang)}
                            </NavLink>

                            {/* Page 27 */}
                            <NavLink
                                to="/page-27"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_investment_detail', lang)}
                            </NavLink>

                            {/* Page 31 */}
                            <NavLink
                                to="/page-31"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_international_investment', lang)}
                            </NavLink>

                            {/* Page 32 */}
                            <NavLink
                                to="/page-32"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_fdi_stock', lang)}
                            </NavLink>

                            {/* Page 37 */}
                            <NavLink
                                to="/page-37"
                                className={({ isActive }) => `nav-link nav-sublink ${isActive ? 'active' : ''}`}
                            >
                                {getText('nav_environmental_protection', lang)}
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
