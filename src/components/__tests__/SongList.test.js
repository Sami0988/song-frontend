import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import configureStore from "redux-mock-store";
import "@testing-library/jest-dom";

import { Provider } from "react-redux";
import SongList from "../SongList";

jest.mock("../../utils/cloudinary");

const mockStore = configureStore([]);

beforeAll(() => {
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
});

describe("SongList component", () => {
  let store;

  beforeEach(() => {
    const initialState = {
      songs: {
        data: [],
        total: 0,
        loading: false,
        error: null,
      },
    };
    store = mockStore(initialState);
    store.clearActions();
  });

  test("renders search input and Add Song button; typing dispatches action", () => {
    render(
      <Provider store={store}>
        <SongList />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText(
      /search songs, albums, artists/i
    );
    expect(searchInput).toBeInTheDocument();

    const addButton = screen.getByRole("button", { name: /add song/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Ethiopian" } });

    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(0);
  });

  test("renders songs list from redux state", () => {
    const sampleSongs = [
      {
        _id: "1",
        title: "Song One",
        artist: "Artist A",
        type: "single",
        album: "Album X",
        year: "2020",
        imageUrl: "",
        audioUrl: "audio1.mp3",
      },
      {
        _id: "2",
        title: "Album One",
        artist: "Artist B",
        type: "album",
        year: "2019",
        imageUrl: "",
      },
    ];

    store = mockStore({
      songs: {
        data: sampleSongs,
        total: 2,
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <SongList />
      </Provider>
    );

    expect(screen.getByText("Song One")).toBeInTheDocument();
    expect(screen.getByText("Artist A")).toBeInTheDocument();
    expect(screen.getByText("From: Album X")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();

    expect(screen.getByText("Album One")).toBeInTheDocument();
    expect(screen.getByText("Artist B")).toBeInTheDocument();
    expect(screen.getByText("Album")).toBeInTheDocument();
  });

  test("clicking play button dispatches play action", () => {
    const sampleSongs = [
      {
        _id: "1",
        title: "Song One",
        artist: "Artist A",
        type: "single",
        album: "Album X",
        year: "2020",
        imageUrl: "",
        audioUrl: "audio1.mp3",
      },
    ];

    store = mockStore({
      songs: {
        data: sampleSongs,
        total: 1,
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <SongList />
      </Provider>
    );
    const playButtons = screen.getAllByRole("button");
    expect(playButtons.length).toBeGreaterThan(0);

    fireEvent.click(playButtons[0]);

    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(0);
  });

  //  clicking Add Song button dispatches an action 
  test("clicking Add Song button dispatches action to open add form", () => {
    render(
      <Provider store={store}>
        <SongList />
      </Provider>
    );

    const addButton = screen.getByRole("button", { name: /add song/i });
    fireEvent.click(addButton);

    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(0);

  });
});
