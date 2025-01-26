import { createContext, useContext } from 'react';

const CardContext = createContext(false);

const useIsInCard = () => useContext(CardContext);

export {CardContext, useIsInCard};