import songsReducer, { fetchSongsRequest, setSongs, setSongsLoading, setSongsError } from '../songsSlice';

describe('songsSlice reducer', () => {
  const initialState = {
    data: [],
    total: 0,
    loading: false,
    error: null
  };

  it('should handle initial state', () => {
    expect(songsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle fetchSongsRequest', () => {
    const nextState = songsReducer(initialState, fetchSongsRequest());
    expect(nextState).toEqual(initialState);
  });

  it('should handle setSongs', () => {
    const action = setSongs({ data: [{ id: 1 }], total: 1 });
    const nextState = songsReducer(initialState, action);
    expect(nextState.data).toHaveLength(1);
    expect(nextState.total).toBe(1);
    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBeNull();
  });

  it('should handle setSongsLoading', () => {
    const action = setSongsLoading(true);
    const nextState = songsReducer(initialState, action);
    expect(nextState.loading).toBe(true);
  });

  it('should handle setSongsError', () => {
    const action = setSongsError('Error occurred');
    const nextState = songsReducer(initialState, action);
    expect(nextState.error).toBe('Error occurred');
    expect(nextState.loading).toBe(false);
  });
});
