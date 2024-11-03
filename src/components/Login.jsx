import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const Login = () => {
  const { name, bookName, Name } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPassword = `${Name}@${bookName}`;

    if (password === correctPassword) {
      navigate(`/${name}/${bookName}/${Name}`);
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">UNLOCK YOUR AUDIOBOOK</h1>
          <p className="text-gray-600">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password to continue"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
