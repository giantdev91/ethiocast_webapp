import React from 'react';

import {dark} from '../constants/';

export const ThemeContext = React.createContext({
    theme: dark,
    setTheme: () => {},
});

export const ThemeProvider = ({
    children,
    theme = dark,
    setTheme = () => {},
}) => {
    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export default function useTheme() {
    var {theme} = React.useContext(ThemeContext);
    return theme;
}
