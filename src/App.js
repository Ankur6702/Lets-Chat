import { Route, Routes } from "react-router-dom";
import Chat from "./components/chat/Chat";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
    </Routes>
  );
}

export default App;
