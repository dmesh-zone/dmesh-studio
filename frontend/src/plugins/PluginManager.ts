import { AppContextType } from '../contexts/AppContext';
import { AppPlugin } from '../types';

export function initializePlugins(context: AppContextType) {
    const basePlugins = import.meta.glob('./base/**/*.ts', { eager: true });
    const customPlugins = import.meta.glob('./custom/**/*.ts', { eager: true });

    const allPlugins = [
        ...Object.values(basePlugins),
        ...Object.values(customPlugins)
    ].map(module => (module as any).default as AppPlugin).filter(Boolean);
    
    console.log("initializePlugins: found plugins:", allPlugins.length);

    // 1. Execute all onReload callbacks
    allPlugins.forEach(plugin => {
        console.log("Executing onReload for plugin", plugin);
        if (plugin.onReload) {
            plugin.onReload(context);
        }
    });

    // 2. Setup all onTimer intervals
    const activeIntervals: number[] = [];
    allPlugins.forEach(plugin => {
        if (plugin.onTimer) {
            plugin.onTimer.forEach(timer => {
                const intervalId = setInterval(() => {
                    timer.callback(context);
                }, timer.intervalMs);
                activeIntervals.push(intervalId as unknown as number);
            });
        }
    });

    // Return a cleanup function
    return () => activeIntervals.forEach(clearInterval);
}
