module.exports = {
  cloudName: "mock-cloud",
  audioUploadPreset: "mock-preset",
  uploadAudio: jest.fn(() => Promise.resolve({ url: "mock-audio-url" })),
};
