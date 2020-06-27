export const createId = (ids: string[]): number => {
    return ids.length > 0 ? Math.max(...ids.map(t => parseInt(t, 10))) + 1 : 1;
};
