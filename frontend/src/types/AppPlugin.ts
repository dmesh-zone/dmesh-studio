import { AppContextType } from '../contexts/AppContext';

export interface AppPlugin {
    /** 
     * Executed exactly once when the application finishes loading its initial state.
     */
    onReload?: (context: AppContextType) => void | Promise<void>;
    
    /** 
     * Executed periodically based on the configured intervals.
     */
    onTimer?: Array<{
        intervalMs: number;
        callback: (context: AppContextType) => void | Promise<void>;
    }>;
}
