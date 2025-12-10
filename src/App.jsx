import AppRouter from "@/router/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <>
            <AppRouter />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
            />
        </>
    );
}

export default App;