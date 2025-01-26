import { TextByLanguage } from '../types/language';

export default interface LanguageText {
    component: string;
    texts: TextByLanguage[];
};