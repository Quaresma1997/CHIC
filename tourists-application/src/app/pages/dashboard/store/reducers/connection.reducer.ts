import * as core from './../../../../core';
import * as actions from './../actions/connection.actions';

export interface ConnectionsState {
    entities: { [id: number]: core.ConnectionModel };
    loaded: boolean;
    loading: boolean;
}

export const initialState: ConnectionsState = {
    entities: {},
    loaded: false,
    loading: false,
};


export function reducer(
    state: ConnectionsState = initialState,
    action: actions.ConnectionsAction
): ConnectionsState {
    switch (action.type) {
        case actions.LOAD_CONNECTIONS_SUCCESS: {
            const connections = action.payload;

            const entities = connections.reduce(
                (accEntities: { [id: number]: core.ConnectionModel }, connection) => {
                    return {
                        ...accEntities,
                        [connection.id]: connection
                    };
                }, []
            );

            return { // return new object (immutable state)
                ...state,
                loading: false,
                loaded: true,
                entities,
            };
        }

        case actions.LOAD_CONNECTIONS_FAIL: {
            return { // return new object (immutable state)
                ...state,
                loaded: false,
                loading: false,
            };
        }

        default:
            return state;
    }
}

export const getConnectionsLoading = (state: ConnectionsState) => state.loading;
export const getConnectionsLoaded = (state: ConnectionsState) => state.loaded;
export const getConnectionsEntities = (state: ConnectionsState) => state.entities;
