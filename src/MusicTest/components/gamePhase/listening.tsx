export const Listening: React.FC = () => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-blue-600"></div>
          <span className="font-medium text-blue-800">
            Playing notes...
          </span>
        </div>
      </div>
      <p className="text-gray-600">
        Listen carefully to the notes being played.
      </p>
    </div>
  );
};
