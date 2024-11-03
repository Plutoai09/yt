import React, { useState, useEffect, useRef } from "react";
import "./ui/ripple.css";
import { useParams } from "react-router-dom";
import {
  Rewind,
  FastForward,
  Play,
  Pause,
  MessageCircle,
  X,
  Loader,
} from "lucide-react";

const AudioPlayer = () => {
  const { name, bookName, Name } = useParams();
  const boooknaame = bookName.replace(/([A-Z])/g, " $1").trim();
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [authorImageSrc, setAuthorImageSrc] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [persona, setPersona] = useState("");
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answerAudioSrc, setAnswerAudioSrc] = useState("");
  const [isAnswerPlaying, setIsAnswerPlaying] = useState(false);
  const answerAudioRef = useRef(null);
  const afterAnswerAudioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);

  const getFullAudioUrl = (path) => {
    const baseUrl = "https://contractus.co.in";
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    const fetchAudiobook = async () => {
      try {
        const response = await fetch("https://contractus.co.in/api/audiobook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, bookName }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch audiobook");
        }

        const data = await response.json();
        console.log(data);
        if (data.chapters && data.chapters.length > 0) {
          setAudioSrc(data.chapters[0].url);
        } else {
          throw new Error("No chapters found in the response");
        }

        setImageSrc(data.imageSrc);
        setAuthorImageSrc(data.authorImageSrc);
        setAuthorName(data.authorName);
        setPersona(data.persona);
        setChapters(data.chapters);
        setError("");
      } catch (error) {
        console.error("Error fetching audiobook:", error);
        setError("Failed to load audiobook. Please try again.");
      }
    };
    fetchAudiobook();
  }, [name, bookName]);

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.onerror = (e) => {
        console.error("Initial audio error:", e);
        setError(`Failed to load initial audio. Error: ${e.type}`);
      };
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      setAudioElement(audio);
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioSrc]);

  useEffect(() => {
    if (audioElement) {
      const handleEnded = () => {
        if (currentChapter < chapters.length - 1) {
          playChapter(currentChapter + 1);
        } else {
          setIsPlaying(false);
        }
      };

      audioElement.addEventListener("ended", handleEnded);

      return () => {
        audioElement.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioElement, currentChapter, chapters]);

  useEffect(() => {
    if (answerAudioSrc) {
      const fullAudioUrl = getFullAudioUrl(answerAudioSrc);
      console.log("Full answer audio URL:", fullAudioUrl);

      fetch(fullAudioUrl, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            setupAudio(fullAudioUrl);
          } else {
            throw new Error(
              `Audio file not found: ${response.status} ${response.statusText}`
            );
          }
        })
        .catch((error) => {
          console.error("Error checking audio file:", error);
          setError(`Failed to load answer audio: ${error.message}`);
        });
    }
  }, [answerAudioSrc]);

  const setupAudio = (url) => {
    if (answerAudioRef.current) {
      answerAudioRef.current.pause();
    }

    // Initialize after-answer audio
    afterAnswerAudioRef.current = new Audio("/audios/afteranswer.mp3");
    afterAnswerAudioRef.current.onerror = (e) => {
      console.error("After-answer audio error:", e);
      setError(`Failed to load after-answer audio. Error: ${e.type}`);
    };

    answerAudioRef.current = new Audio(url);
    answerAudioRef.current.onerror = (e) => {
      console.error("Answer audio error:", e);
      setError(`Failed to load answer audio. Error: ${e.type}`);
    };

    answerAudioRef.current.addEventListener("loadedmetadata", () => {
      console.log("Audio metadata loaded successfully");
    });

    answerAudioRef.current.addEventListener("canplaythrough", () => {
      console.log("Audio can play through");
      playAnswerAudio();
    });

    answerAudioRef.current.addEventListener("ended", () => {
      playAfterAnswerAudio();
    });

    afterAnswerAudioRef.current.addEventListener("ended", () => {
      setIsAnswerPlaying(false);
      resumeMainAudio();
    });
  };

  const playAnswerAudio = () => {
    if (answerAudioRef.current) {
      answerAudioRef.current
        .play()
        .then(() => {
          setIsAnswerPlaying(true);
        })
        .catch((e) => {
          console.error("Failed to play answer audio:", e);
          setError(`Failed to play answer audio. Error: ${e.message}`);
        });
    }
  };

  const playAfterAnswerAudio = () => {
    if (afterAnswerAudioRef.current) {
      afterAnswerAudioRef.current
        .play()
        .then(() => {
          console.log("Playing after-answer audio");
        })
        .catch((e) => {
          console.error("Failed to play after-answer audio:", e);
          setError(`Failed to play after-answer audio. Error: ${e.message}`);
          // If after-answer audio fails, still continue to main audio
          setIsAnswerPlaying(false);
          resumeMainAudio();
        });
    }
  };

  const resumeMainAudio = () => {
    if (audioElement) {
      audioElement.currentTime = lastPlayedTime;
      audioElement.play().catch((e) => {
        console.error("Failed to resume main audio:", e);
        setError(`Failed to resume main audio. Error: ${e.message}`);
      });
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setLastPlayedTime(audioElement.currentTime);
      } else {
        audioElement.play().catch((e) => {
          console.error("Failed to play audio:", e);
          setError(`Failed to play audio. Error: ${e.message}`);
        });
      }
      setIsPlaying(!isPlaying);
    } else if (chapters.length > 0) {
      playChapter(0);
    }
  };

  const playChapter = (index) => {
    if (audioElement) {
      audioElement.pause();
    }
    setCurrentChapter(index);
    const newAudio = new Audio(chapters[index].url);
    newAudio.onloadedmetadata = () => {
      setDuration(newAudio.duration);
    };
    newAudio.ontimeupdate = () => {
      setCurrentTime(newAudio.currentTime);
    };
    setAudioElement(newAudio);
    newAudio.play().catch((e) => {
      console.error("Failed to play chapter audio:", e);
      setError(`Failed to play chapter audio. Error: ${e.message}`);
    });
    setIsPlaying(true);
  };

  const handleNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      playChapter(currentChapter + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapter > 0) {
      playChapter(currentChapter - 1);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      setLastPlayedTime(audioElement.currentTime);
    }

    setIsProcessing(true);

    try {
      const response = await fetch("https://contractus.co.in/askquestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, persona, Name, bookName }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setAnswer(data.answer);
      setAnswerAudioSrc(data.audioUrl);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Failed to get an answer. Please try again.");
      setError(`Failed to get answer. Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuestion("");
    setAnswer("");
    setError("");
  };

  const rippleElements = [
    { duration: "1s", delay: "0.1s" },
    { duration: "1s", delay: "0.2s" },
    { duration: "1s", delay: "0.3s" },
  ];

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full h-full max-h-[900px] sm:max-w-[375px] bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col mb-6 relative">
        {/* Author Image - Positioned above book image */}
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${
            !isModalOpen ? "z-10" : ""
          }`}
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={authorImageSrc || "/api/placeholder/96/96"}
                alt="Author"
                className="w-full h-full object-cover"
              />
            </div>
            {isAnswerPlaying &&
              rippleElements.map((ripple, index) => (
                <div
                  key={index}
                  className="absolute rounded-full border border-blue-300"
                  style={{
                    animation: `ripple ${ripple.duration} ease-out ${ripple.delay} infinite`,
                    width: "120%",
                    height: "120%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0.7,
                  }}
                />
              ))}
          </div>
        </div>

        {/* Book Image Section - Adjusted height */}
        <div className="relative w-full pt-[50%] ">
          <div className="absolute inset-0">
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ${
                isAnswerPlaying
                  ? "bg-gradient-to-b from-blue-600 to-blue-800 filter blur-sm"
                  : ""
              }`}
            />
            <img
              src={imageSrc || "/api/placeholder/375/288"}
              alt="Book cover"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                isAnswerPlaying ? "filter blur-sm" : ""
              }`}
            />
            <div
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isAnswerPlaying ? "opacity-30" : "opacity-0"
              }`}
            />
          </div>
        </div>

        {/* Book Info Card - Overlapping the image */}
        <div className={`relative -mt-10 px-6 ${!isModalOpen ? "z-10" : " "}`}>
          <div className="bg-white rounded-[20px] p-4 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-1">
              {boooknaame}
            </h2>
            <p className="text-sm sm:text-base text-center text-gray-600">
              {authorName || name}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() =>
                  (window.location.href = "https://getpluto.in/upgrade")
                }
                className="mt-2 px-3 py-1 text-white text-sm font-semibold rounded-full"
                style={{ backgroundColor: "#4b1d63" }}
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
        {/* Chapters List - Adjusted height */}
        <div className="flex-1 min-h-0 px-6 mt-4 mb-4 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                onClick={() => playChapter(index)}
                className={`py-2 sm:py-2.5 border-b border-gray-200 first:border-t ${
                  currentChapter === index ? "bg-gray-50" : ""
                } cursor-pointer transition-colors`}
              >
                <div className="px-2">
                  <p className="text-xs text-gray-400 mb-0.5">
                    Chapter {index + 1}
                  </p>
                  <p
                    className={`text-sm text-gray-900 ${
                      currentChapter === index ? "font-bold" : ""
                    }`}
                  >
                    {chapter.title || `Chapter ${index + 1}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-gray-100 shadow-lg rounded-t-[30px] p-4">
          <div className="flex justify-center mb-3">
            <button
              onClick={() => {
                setIsModalOpen(true);
                if (audioElement && isPlaying) {
                  audioElement.pause();
                  setIsPlaying(false);
                  setLastPlayedTime(audioElement.currentTime);
                }
              }}
              className="bg-black text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-600 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm">Ask Question</span>
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <button className="text-gray-400 hover:text-gray-600">
              <Rewind size={20} />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-md hover:shadow-lg transition-shadow"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <FastForward size={20} />
            </button>
          </div>

          <div className="flex items-center">
            <span className="text-xs text-gray-500 w-8">
              {formatTime(currentTime)}
            </span>
            <div className="flex-grow mx-2">
              <div className="h-1 w-full bg-gray-300 rounded-full">
                <div
                  className="h-1 bg-blue-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm ">
          <div className="bg-white p-4 rounded-[24px] w-full max-w-md shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Ask a Question
            </h2>

            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
                rows={4}
                placeholder="What would you like to know?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2.5 rounded-full hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin w-4 h-4" />
                    <span className="text-sm">Thinking...</span>
                  </>
                ) : (
                  <span className="text-sm">Ask Question</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <audio ref={answerAudioRef} />
    </div>
  );
};

export default AudioPlayer;
