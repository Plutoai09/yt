import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateForm = () => {
  const [name, setName] = useState("");
  const [bookName, setBookName] = useState("");
  const [persona, setPersona] = useState("");
  const [audiobooks, setAudiobooks] = useState([]);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bookName", bookName);
    formData.append("persona", persona);
    audiobooks.forEach((audio, index) => {
      formData.append(`audiobook${index + 1}`, audio);
    });
    if (image) formData.append("image", image);
    if (chapters) formData.append("chapters", chapters);

    try {
      const response = await axios.post(
        "https://contractus.co.in/update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(response.data);
      navigate(`/${name}/${bookName}`);
    } catch (err) {
      setError("Failed to update content. Please try again.");
      console.error("Error updating content:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioChange = (e) => {
    const files = Array.from(e.target.files);
    setAudiobooks(files);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Update Content</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="bookName" className="block mb-1">
            Book Name:
          </label>
          <input
            type="text"
            id="bookName"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="persona" className="block mb-1">
            Persona:
          </label>
          <textarea
            id="persona"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="audiobooks" className="block mb-1">
            Audiobooks (MP3, multiple):
          </label>
          <input
            type="file"
            id="audiobooks"
            accept=".mp3"
            multiple
            onChange={handleAudioChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="image" className="block mb-1">
            Image (JPEG):
          </label>
          <input
            type="file"
            id="image"
            accept=".jpeg,.jpg"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="chapters" className="block mb-1">
            Chapters (TXT):
          </label>
          <input
            type="file"
            id="chapters"
            accept=".txt"
            onChange={(e) => setChapters(e.target.files[0])}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default UpdateForm;
