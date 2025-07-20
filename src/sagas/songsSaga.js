// src/sagas/songsSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchSongs } from '../api/songsApi';
import { setSongs, setSongsLoading, setSongsError } from '../store/songsSlice';

// Worker Saga
export function* handleFetchSongs(action) {
  try {
    yield put(setSongsLoading(true));
    const data = yield call(fetchSongs, action.payload);
    yield put(setSongs(data));
  } catch (error) {
    yield put(setSongsError(error.message));
  }
}

// Watcher Saga
export function* watchSongsSaga() {
  yield takeLatest('songs/fetchSongsRequest', handleFetchSongs);
}