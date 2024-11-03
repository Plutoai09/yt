import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to Audiobook Player</h1>
      <Link to="/john/react-basics">Listen to React Basics</Link>
    </div>
  );
}

export default Home;
