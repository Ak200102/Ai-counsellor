export default function Button({ children, ...p }) {
  return (
    <button
      {...p}
      className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition"
    >
      {children}
    </button>
  );
}
