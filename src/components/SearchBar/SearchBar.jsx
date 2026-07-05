// src/components/SearchBar/SearchBar.jsx

import "./SearchBar.css";

export default function SearchBar({

    value,

    onChange,

    placeholder = "Buscar..."

}) {

    return (

        <div className="SearchBar">

            <svg
                className="SearchBar-Icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <input
                type="text"
                value={value}
                onChange={event => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />

        </div>

    );

}
