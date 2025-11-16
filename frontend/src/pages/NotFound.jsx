function NotFound() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50">
        <div className="text-center p-8">
          <h1 className="text-9xl font-extrabold text-blue-600 drop-shadow-lg">404</h1>
          <p className="mt-4 text-2xl font-semibold text-gray-800">
            Oops! Page not found
          </p>
          <p className="mt-2 text-gray-600">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
  
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                       shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105
                       transition duration-300"
          >
            Go Back To Home
          </a>
        </div>
      </div>
    );
  }
  
  export default NotFound;
  