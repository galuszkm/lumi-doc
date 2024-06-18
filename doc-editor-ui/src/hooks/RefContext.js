import React, { createContext, useContext, useRef } from 'react';

const RefContext = createContext(null);

export const RefProvider = ({ children }) => {
    const ref = useRef(null);
    return (
        <RefContext.Provider value={ref}>
            {children}
        </RefContext.Provider>
    );
};

export const useRefContext = () => useContext(RefContext);