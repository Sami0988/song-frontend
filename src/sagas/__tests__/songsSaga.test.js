
import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchSongs } from '../../api/songsApi';
import * as songsSaga from '../songsSaga';
import { setSongs, setSongsLoading, setSongsError } from '../../store/songsSlice';

jest.mock('../../api/songsApi', () => ({
  fetchSongs: jest.fn(),
}));

describe('songsSaga', () => {
  describe('handleFetchSongs', () => {
    it('should handle successful song fetching', () => {
      const page = 1;
      const action = { payload: page };
      const mockResponse = { data: [{ id: 1, title: 'Test Song' }] };
      
      const generator = songsSaga.handleFetchSongs(action);

      // Check that loading is set to true
      expect(generator.next().value).toEqual(put(setSongsLoading(true)));

      // Check that the API is called with the correct page
      expect(generator.next().value).toEqual(call(fetchSongs, page));

      // Mock the API response and check that songs are set
      // Note: Changed to match the actual payload structure
      expect(generator.next(mockResponse).value)
        .toEqual(put(setSongs(mockResponse)));

      // Check that the saga completes
      expect(generator.next().done).toBe(true);
    });

    it('should handle song fetching errors', () => {
      const page = 1;
      const action = { payload: page };
      const errorMessage = 'Failed to fetch songs';
      
      const generator = songsSaga.handleFetchSongs(action);

      // Advance to the API call
      generator.next(); 
      generator.next(); 

      // Mock an error and check that error is set
      expect(generator.throw(new Error(errorMessage)).value).toEqual(
        put(setSongsError(errorMessage))
      );

      // Check that the saga completes
      expect(generator.next().done).toBe(true);
    });
  });

  describe('watchSongsSaga', () => {
    it('should watch for fetchSongsRequest actions', () => {
      const generator = songsSaga.watchSongsSaga();
      
      expect(generator.next().value).toEqual(
        takeLatest('songs/fetchSongsRequest', songsSaga.handleFetchSongs)
      );
      
      expect(generator.next().done).toBe(true);
    });
  });
});