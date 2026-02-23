import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./routes/Navigation";
import { useAuthStore } from "./hooks/useAuthStore";

function App() {
  const { fetchUser, access_token } = useAuthStore();

  useEffect(() => {
    if (access_token) {
      fetchUser();
    }
  }, [fetchUser, access_token]);

  return (
    <div className="dark">
      <Navigation />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
