import type { GoogleAnalyticsData } from '../types';
import type { FSAction } from '~/types';

export enum AuthStatus {
  GAPI_LOADING = 'GAPI_LOADING',
  GAPI_READY = 'GAPI_READY',
  GAPI_ERROR = 'GAPI_ERROR',
  AUTH_IN_PROCESS = 'AUTH_IN_PROCESS',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_ERROR = 'AUTH_ERROR',
}

export type State =
  | { status: AuthStatus.GAPI_LOADING }
  | { status: AuthStatus.GAPI_READY }
  | { status: AuthStatus.GAPI_ERROR; error: Error }
  | { status: AuthStatus.AUTH_IN_PROCESS }
  | { status: AuthStatus.AUTH_SUCCESS; data: GoogleAnalyticsData }
  | { status: AuthStatus.AUTH_ERROR; error: Error };

enum ActionType {
  GAPI_LOAD = 'GAPI_LOAD',
  GAPI_READY = 'GAPI_READY',
  GAPI_ERROR = 'GAPI_ERROR',
  AUTH_START = 'AUTH_START',
  AUTH_COMPLETE = 'AUTH_COMPLETE',
  AUTH_ERROR = 'AUTH_ERROR',
}

export type Action =
  | FSAction<ActionType.GAPI_LOAD>
  | FSAction<ActionType.GAPI_READY>
  | FSAction<ActionType.GAPI_ERROR, Error>
  | FSAction<ActionType.AUTH_START>
  | FSAction<ActionType.AUTH_COMPLETE, GoogleAnalyticsData>
  | FSAction<ActionType.AUTH_ERROR, Error>;

// TODO: remove undefined when we upgrade to typescript 4.4 and make payload in type definition optional
export const actions = {
  gapiLoad: (): Action => ({ type: ActionType.GAPI_LOAD, payload: undefined }),
  gapiReady: (): Action => ({ type: ActionType.GAPI_READY, payload: undefined }),
  gapiError: (payload: Error): Action => ({
    type: ActionType.GAPI_ERROR,
    payload,
    error: true,
  }),
  authStart: (): Action => ({ type: ActionType.AUTH_START, payload: undefined }),
  authComplete: (payload: GoogleAnalyticsData): Action => ({
    type: ActionType.AUTH_COMPLETE,
    payload,
  }),
  authError: (payload: Error): Action => ({ type: ActionType.AUTH_ERROR, payload, error: true }),
};

// eslint-disable-next-line complexity
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.GAPI_LOAD:
      return { status: AuthStatus.GAPI_LOADING };

    case ActionType.GAPI_READY:
      if (![AuthStatus.GAPI_LOADING].includes(state.status)) break;
      return { status: AuthStatus.GAPI_READY };

    case ActionType.GAPI_ERROR:
      if (![AuthStatus.GAPI_LOADING].includes(state.status)) break;
      return { status: AuthStatus.GAPI_ERROR, error: action.payload };

    case ActionType.AUTH_START:
      if (![AuthStatus.GAPI_READY, AuthStatus.AUTH_ERROR].includes(state.status)) break;
      return { status: AuthStatus.AUTH_IN_PROCESS };

    case ActionType.AUTH_COMPLETE:
      if (![AuthStatus.AUTH_IN_PROCESS].includes(state.status)) break;
      return { status: AuthStatus.AUTH_SUCCESS, data: action.payload };

    case ActionType.AUTH_ERROR:
      if (![AuthStatus.AUTH_IN_PROCESS].includes(state.status)) break;
      return { status: AuthStatus.AUTH_ERROR, error: action.payload };
  }

  console.debug('illegal transition [ state:', state.status, ', action:', action.type, ']');
  return state;
}
