import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { fetchSongs } from "../songsApi";

describe("fetchSongs", () => {
  it("should fetch songs and return correct data", async () => {
    const mock = new MockAdapter(axios);

    const sampleResponse = {
      data: [
        { id: 1, title: "Tizita", artist: "Tilahun Gessesse" },
        { id: 2, title: "Yene Felagote", artist: "Aster Aweke" },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    const page = 1;
    const limit = 8;

    // Must match the URL that fetchSongs will call
    mock
      .onGet(`http://localhost:5000/api/songs?page=${page}&limit=${limit}`)
      .reply(200, sampleResponse);

    const data = await fetchSongs({ page, limit }); // ✅ Correct argument

    expect(data).toEqual(sampleResponse);
    expect(data.data[0].title).toBe("Tizita");
    expect(data.data.length).toBe(2);

    mock.restore();
  });

  it("should throw error on 404", async () => {
    const mock = new MockAdapter(axios);

    const page = 99;
    const limit = 8;

    mock
      .onGet(`http://localhost:5000/api/songs?page=${page}&limit=${limit}`)
      .reply(404);

    await expect(fetchSongs({ page, limit })).rejects.toThrow(
      "Request failed with status code 404"
    );

    mock.restore();
  });
});
