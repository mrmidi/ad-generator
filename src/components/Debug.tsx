export default function Debug() {
  return (
    <div id="debugBlock" className="mt-4">
      <h5 className="text-lg font-medium text-gray-700 mb-2">
        Debug Messages:
      </h5>
      <pre
        id="debugMessages"
        className="bg-gray-800 text-green-400 p-3 border border-gray-300 rounded-md text-xs font-mono max-h-48 overflow-y-auto"
      ></pre>
    </div>
  );
}
