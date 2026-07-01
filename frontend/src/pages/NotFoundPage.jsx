import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center text-center py-24 gap-4">
      <p className="text-8xl font-semibold text-gray-100">404</p>
      <h1 className="text-2xl font-medium text-gray-900">Page not found</h1>
      <p className="text-gray-500">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 mt-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Home size={16} />
        Go home
      </Link>
    </div>
  );
};

export default NotFoundPage;
