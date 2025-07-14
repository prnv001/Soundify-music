import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const artists = [
  { label: "Sidhu Moose Wala ⭐", query: "sidhu moose wala" },
  { label: "Karan Aujla 🎧", query: "karan aujla" },
  { label: "Lata Mangeshkar 🎗️", query: "lata mangeshkar" },
  { label: "Udit Narayan 🪄", query: "udit narayan" },
  { label: "Rajesh Khanna ❤️", query: "rajesh khanna" },
];

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState(artists[0]);

  const audioRef = useRef(null);
  const currentSong = songs[currentSongIndex] || {};

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get(
          `https://deezerdevs-deezer.p.rapidapi.com/search?q=${selectedArtist.query}`,
          {
            headers: {
              "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
              "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
            },
          }
        );
        const fetched = res.data.data.map((song) => ({
          title: song.title,
          artist: song.artist.name,
          src: song.preview,
          cover: song.album.cover_medium,
        }));
        setSongs(fetched);
        setCurrentSongIndex(0);
        setIsPlaying(false);
        setProgress(0);
      } catch (err) {
        console.error("Error fetching songs:", err);
      }
    };

    fetchSongs();
  }, [selectedArtist]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(console.error);
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setTimeout(() => audioRef.current?.play(), 100);
    setIsPlaying(true);
  };

  const playPrev = () => {
    const prevIndex =
      currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    setTimeout(() => audioRef.current?.play(), 100);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isNaN(audio.duration)) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    setProgress(percent);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || isNaN(audio.duration)) return;
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("ended", playNext);
    return () => audio.removeEventListener("ended", playNext);
  }, [currentSongIndex, songs]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-6 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-pink-500 mb-6 text-center">
        🎵 Soundify
      </h1>

      {/* Artist Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {artists.map((artistObj) => (
          <button
            key={artistObj.query}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-base rounded-full transition-all duration-200 ${
              selectedArtist.query === artistObj.query
                ? "bg-pink-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedArtist(artistObj)}
          >
            {artistObj.label}
          </button>
        ))}
      </div>

      {currentSong.title ? (
        <>
          <img
            src={currentSong.cover}
            alt="cover"
            className="w-36 h-36 sm:w-60 sm:h-60 rounded-full shadow-lg mb-4 object-cover"
          />
          <h2 className="text-lg sm:text-2xl font-semibold text-center text-gray-800 dark:text-white">
            {currentSong.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center">
            {currentSong.artist}
          </p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button onClick={playPrev} className="text-xl sm:text-2xl">
              ⏮
            </button>
            <button
              onClick={togglePlay}
              className="text-xl sm:text-2xl bg-pink-500 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-pink-600"
            >
              {isPlaying ? "⏸ Pause" : "▶️ Play"}
            </button>
            <button onClick={playNext} className="text-xl sm:text-2xl">
              ⏭
            </button>
          </div>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full mt-6 accent-pink-500"
          />

         {/* Volume Control */}
          <div className="mt-4 w-full flex flex-col gap-1">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              className="accent-pink-500"
            />
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-white mt-8 text-center">Loading songs...</p>
      )}

  {/* Dark Modee */}
      <button
        onClick={() => document.documentElement.classList.toggle("dark")}
        className="mt-6 bg-gray-800 text-white px-4 py-2 rounded"
      >
        🌗 Toggle Dark Mode
      </button>

      {/* Audio */}
      <audio
        ref={audioRef}
        src={currentSong.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        preload="metadata"
      />
    </div>
  );
};

export default MusicPlayer;
