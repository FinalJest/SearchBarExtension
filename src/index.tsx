import ReactDOM from 'react-dom';
import React from 'react';
import SearchBar from './SearchBar/SearchBar';
import * as types from 'styled-components/cssprop'

declare global {
    const chrome: any;
}

ReactDOM.render(<SearchBar />, document.getElementById('root'));
