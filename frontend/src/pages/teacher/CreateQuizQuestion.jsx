import { useState } from "react";
import api from "../../services/api";

function CreateQuizQuestion() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState(10);
  const [timer, setTimer] = useState(600); // in seconds

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    // try {
    //   const response = await api.post("/quiz/create/", { title });
    //   setMessage(" Quiz created successfully!");
    //   setTitle("");
    //   setQuizCode(response.data.code); // <- capture generated quiz code
    // } catch (err) {
    //   setMessage("Failed to create quiz: " + (err.response?.data?.detail || "Unknown error"));
    // }
  };


  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Create a New Quiz</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded p-2 focus:ring focus:ring-blue-300"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Quiz
        </button>
      </form>
    </div>
  );
}

export default CreateQuizQuestion;
